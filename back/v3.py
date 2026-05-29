import json
import os
import time
import csv
import io
import pymysql
import urllib.request
import hashlib
import hmac
import uuid
from google import genai 

# 1. Configurações e Credenciais
client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))
MODEL_ID = 'gemini-2.5-flash' 

DB_HOST = os.environ.get('DB_HOST')
DB_USER = os.environ.get('DB_USER')
DB_PASS = os.environ.get('DB_PASS')
DB_NAME = 'db-zentrix'
SSL_CA = 'global-bundle.pem'

# Configurações do Telegram
TELEGRAM_TOKEN = os.environ.get('TELEGRAM_TOKEN')
ZENTRIX_USER_ID = os.environ.get('ZENTRIX_USER_ID', 'usuario_padrao')

MINHAS_CATEGORIAS = [
    "Essencial", "Role e Lazer", "Rangos", "Transporte", 
    "Assinaturas", "Compras e Mimos", "A receber", "Outros"
]

def get_db_connection():
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME,
        ssl={'ca': SSL_CA},
        cursorclass=pymysql.cursors.DictCursor
    )

def enviar_mensagem_telegram(chat_id, texto):
    """Função auxiliar para enviar respostas de confirmação via Telegram"""
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": texto,
        "parse_mode": "Markdown"
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            return response.read()
    except Exception as e:
        print(f"ERRO AO ENVIAR MENSAGEM AO TELEGRAM: {str(e)}")

# --- ROTEADOR PRINCIPAL ---
def lambda_handler(event, context):
    metodo = event.get('httpMethod') or event.get('requestContext', {}).get('http', {}).get('method')
    
    try:
        if metodo == 'POST':
            return tratar_post(event)
        elif metodo == 'GET':
            return tratar_get(event)
        elif metodo == 'DELETE':
            return tratar_delete(event)
        elif metodo == 'PUT':
            return tratar_put(event)
        else:
            return tratar_post(event)
            
    except Exception as e:
        print(f"ERRO CRÍTICO: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'erro': str(e)})
        }

# --- ENDPOINT: POST (Criação, Autenticação e Webhooks) ---
def tratar_post(event):
    body = json.loads(event.get('body', '{}'))
    conn = get_db_connection()

    try:
        with conn.cursor() as cursor:
            
            # --- CASO 1: BOT DO TELEGRAM (Mensagens vindas do Chat) ---
            if 'message' in body:
                telegram_msg = body.get('message', {})
                chat_id = telegram_msg.get('chat', {}).get('id')
                user_telegram_id = telegram_msg.get('from', {}).get('id')
                first_name = telegram_msg.get('from', {}).get('first_name', 'Usuário Telegram')
                texto_recebido = telegram_msg.get('text', '')

                if not texto_recebido:
                    enviar_mensagem_telegram(chat_id, "⚠️ Por enquanto só consigo processar mensagens de texto.")
                    return {'statusCode': 200, 'body': json.dumps('Mensagem sem texto')}

                # Gestão Multiusuário Dinâmica: Busca ou registra o usuário no banco
                cursor.execute("SELECT id FROM usuarios WHERE id = %s", (str(user_telegram_id),))
                usuario_existente = cursor.fetchone()

                if usuario_existente:
                    id_final_usuario = usuario_existente['id']
                else:
                    # Cadastro Automático (Garante conformidade com as restrições NOT NULL do schema)
                    email_placeholder = f"{user_telegram_id}@telegram.zentrix"
                    sql_novo_user = "INSERT INTO usuarios (id, nome, email, password_hash) VALUES (%s, %s, %s, %s)"
                    cursor.execute(sql_novo_user, (str(user_telegram_id), first_name, email_placeholder, 'TELEGRAM_AUTH'))
                    conn.commit()
                    id_final_usuario = str(user_telegram_id)

                # Processamento da inteligência artificial (Gemini)
                prompt_ia = f"""
                Extraia os dados da frase: '{texto_recebido}'
                Categorias: {MINHAS_CATEGORIAS}
                Tipos permitidos: [Débito, Crédito à Vista, Crédito Parcelado, Emprestado]
                
                Regras de Tipo:
                - Se eu disser 'no débito' ou 'no pix' -> Débito
                - Se houver parcelas -> Crédito Parcelado
                - Se for 'A receber' -> Emprestado
                - Padrão -> Crédito à Vista
                
                Retorne APENAS um JSON: {{"description": "nome", "amount": float, "category": "categoria", "type": "tipo", "installments": int, "debtor_name": "nome ou null"}}
                """
                
                response = client.models.generate_content(model=MODEL_ID, contents=prompt_ia)
                dados = json.loads(response.text.replace('```json', '').replace('```', '').strip())
                
                sql = """
                    INSERT INTO transacoes 
                    (user_id, description, amount, category, type, source, installments_total, debtor_name, raw_input_phrase) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(sql, (
                    id_final_usuario, 
                    dados['description'], 
                    dados['amount'], 
                    dados['category'], 
                    dados['type'], 
                    'TELEGRAM_BOT', 
                    dados.get('installments', 1),
                    dados.get('debtor_name'),
                    texto_recebido
                ))
                conn.commit()

                msg_confirmacao = (
                    f"✅ *Transação Salva no Zentrix!*\n\n"
                    f"📝 *Item:* {dados['description']}\n"
                    f"💰 *Valor:* R$ {dados['amount']:.2f}\n"
                    f"🏷️ *Categoria:* {dados['category']}\n"
                    f"💳 *Tipo:* {dados['type']}"
                )
                if dados.get('installments', 1) > 1:
                    msg_confirmacao += f"\n🔢 *Parcelas:* {dados['installments']}"
                if dados.get('debtor_name'):
                    msg_confirmacao += f"\n👤 *Devedor:* {dados['debtor_name']}"

                enviar_mensagem_telegram(chat_id, msg_confirmacao)
                return {'statusCode': 200, 'body': json.dumps('Telegram processado')}

            # --- CASO NEW: ROTA DE AUTENTICAÇÃO (Login de 1 Clique via Front-end Web) ---
            elif 'hash' in body and 'id' in body:
                tg_hash = body.get('hash')
                auth_date = body.get('auth_date')
                telegram_id = body.get('id')
                first_name = body.get('first_name', '')

                # STRIDE: Mitigação de Tampering. Organiza os parâmetros em ordem alfabética
                data_check_list = []
                for key, value in sorted(body.items()):
                    if key != 'hash':
                        data_check_list.append(f"{key}={value}")
                data_check_string = "\n".join(data_check_list)

                # Validação da Assinatura Criptográfica baseada no Token do seu Bot
                secret_key = hashlib.sha256(TELEGRAM_TOKEN.encode('utf-8')).digest()
                local_hash = hmac.new(secret_key, data_check_string.encode('utf-8'), hashlib.sha256).hexdigest()

                if local_hash != tg_hash:
                    return {
                        'statusCode': 401,
                        'headers': {'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'erro': 'Assinatura inválida. Tentativa de Spoofing detectada.'})
                    }

                # Proteção contra Replay Attacks (Sessões com mais de 24 horas são invalidadas)
                if time.time() - int(auth_date) > 86400:
                    return {
                        'statusCode': 401,
                        'headers': {'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'erro': 'Assinatura do Telegram expirada.'})
                    }

                # Garante que o usuário autenticado pelo site exista ou seja criado no banco
                cursor.execute("SELECT id FROM usuarios WHERE id = %s", (str(telegram_id),))
                usuario = cursor.fetchone()

                if usuario:
                    id_final_usuario = usuario['id']
                else:
                    email_placeholder = f"{telegram_id}@telegram.zentrix"
                    sql_novo_user = "INSERT INTO usuarios (id, nome, email, password_hash) VALUES (%s, %s, %s, %s)"
                    cursor.execute(sql_novo_user, (str(telegram_id), first_name, email_placeholder, 'TELEGRAM_AUTH'))
                    conn.commit()
                    id_final_usuario = str(telegram_id)

                # Emissão do token de sessão seguro para o Front-end
                session_token = str(uuid.uuid4())
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'login': True,
                        'token_sessao': session_token,
                        'user_id_interno': id_final_usuario,
                        'nome': first_name
                    })
                }

            # --- CASO 2: IMPORTAÇÃO DE CSV (C6 BANK) ---
            elif 'csv_text' in body:
                user_id = body.get('user_id', ZENTRIX_USER_ID)
                f = io.StringIO(body['csv_text'].strip())
                reader = list(csv.DictReader(f, delimiter=';'))
                descricoes_brutas = list(set([row.get('Descrição', '') for row in reader if row.get('Descrição')]))
                
                prompt_lote = f"""
                Categorias: {MINHAS_CATEGORIAS}.
                Para cada item abaixo, retorne um JSON com a chave sendo o nome original:
                {{ "desc_limpa": "nome curto", "cat": "categoria" }}
                Itens: {descricoes_brutas}
                """
                
                response = client.models.generate_content(model=MODEL_ID, contents=prompt_lote)
                mapa_categorias = json.loads(response.text.replace('```json', '').replace('```', '').strip())
                
                contagem = 0
                sql = """
                    INSERT INTO transacoes 
                    (user_id, description, amount, category, type, source, installments_total, installments_paid) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """
                
                for row in reader:
                    desc_orig = row.get('Descrição', '')
                    valor_bruto = row.get('Valor (em R$)', '0').replace('.', '').replace(',', '.')
                    valor = float(valor_bruto)
                    if valor <= 0: continue
                    
                    info_ia = mapa_categorias.get(desc_orig, {"desc_limpa": desc_orig, "cat": "Outros"})
                    parcela_raw = row.get('Parcela', 'Única')
                    
                    total_p = 1
                    paga_p = 1
                    if "/" in parcela_raw:
                        partes = parcela_raw.split("/")
                        paga_p = int(partes[0])
                        total_p = int(partes[1])
                    
                    tipo_movimentacao = "Crédito Parcelado" if "/" in parcela_raw else "Crédito à Vista"
                    if info_ia['cat'] == "A receber":
                        tipo_movimentacao = "Emprestado"

                    cursor.execute(sql, (user_id, info_ia['desc_limpa'], valor, info_ia['cat'], tipo_movimentacao, 'C6_BANK', total_p, paga_p))
                    contagem += 1
                
                conn.commit()
                return {'statusCode': 201, 'body': json.dumps(f'{contagem} itens processados!')}

            # --- CASO 3: FRASE POR VOZ DIRECT API ---
            elif 'frase' in body:
                user_id = body.get('user_id', ZENTRIX_USER_ID)
                prompt_ia = f"""
                Extraia os dados da frase: '{body['frase']}'
                Categorias: {MINHAS_CATEGORIAS}
                Tipos permitidos: [Débito, Crédito à Vista, Crédito Parcelado, Emprestado]
                
                Retorne APENAS um JSON: {{"description": "nome", "amount": float, "category": "categoria", "type": "tipo", "installments": int, "debtor_name": "nome ou null"}}
                """
                response = client.models.generate_content(model=MODEL_ID, contents=prompt_ia)
                dados = json.loads(response.text.replace('```json', '').replace('```', '').strip())
                
                sql = """
                    INSERT INTO transacoes 
                    (user_id, description, amount, category, type, source, installments_total, debtor_name, raw_input_phrase) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(sql, (
                    user_id, 
                    dados['description'], 
                    dados['amount'], 
                    dados['category'], 
                    dados['type'], 
                    'IA_CHAT', 
                    dados.get('installments', 1),
                    dados.get('debtor_name'),
                    body['frase']
                ))
                
                conn.commit()
                return {'statusCode': 201, 'body': json.dumps({'message': 'Salvo!', 'dados': dados})}

    finally:
        conn.close()

# --- ENDPOINT: GET (Consumo de Dados para o App Mobile e Web) ---
def tratar_get(event):
    params = event.get('queryStringParameters', {}) or {}
    user_id = params.get('user_id', ZENTRIX_USER_ID)
    
    if not user_id:
        return {'statusCode': 400, 'body': json.dumps('user_id é obrigatório')}
        
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            sql = "SELECT * FROM transacoes WHERE user_id = %s ORDER BY created_at DESC"
            cursor.execute(sql, (user_id,))
            items = cursor.fetchall()

            sql_user = "SELECT * FROM usuarios WHERE id = %s"
            cursor.execute(sql_user, (user_id,))
            user_info = cursor.fetchone()

        return {
            'statusCode': 200, 
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'transacoes': items, 'usuario': user_info}, default=str)
        }
    finally:
        conn.close()

# --- ENDPOINT: DELETE (Exclusão de Transações pelo App Mobile) ---
def tratar_delete(event):
    body = json.loads(event.get('body', '{}'))
    user_id = body.get('user_id', ZENTRIX_USER_ID)
    transacao_id = body.get('id') 
    
    if not user_id or not transacao_id:
        return {'statusCode': 400, 'body': json.dumps('Faltam chaves para deletar')}
        
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            sql = "DELETE FROM transacoes WHERE id = %s AND user_id = %s"
            cursor.execute(sql, (transacao_id, user_id))
            conn.commit()
            
        return {'statusCode': 200, 'body': json.dumps('Item removido.')}
    finally:
        conn.close()

# --- ENDPOINT: PUT (Atualização de Dados) ---
def tratar_put(event):
    body = json.loads(event.get('body', '{}'))
    user_id = body.get('user_id', ZENTRIX_USER_ID)
    action = body.get('action')
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            if action == 'update_transaction':
                transacao_id = body.get('id')
                if not transacao_id:
                    return {'statusCode': 400, 'body': json.dumps('ID da transação não fornecido')}
                
                campos = []
                valores = []
                
                if 'amount' in body:
                    campos.append("amount = %s")
                    valores.append(body['amount'])
                if 'description' in body:
                    campos.append("description = %s")
                    valores.append(body['description'])
                if 'category' in body:
                    campos.append("category = %s")
                    valores.append(body['category'])
                if 'status' in body:
                    campos.append("status = %s")
                    valores.append(body['status'])
                
                if not campos:
                    return {'statusCode': 400, 'body': json.dumps('Nenhum campo para atualizar na transação')}
                
                valores.extend([transacao_id, user_id])
                sql = f"UPDATE transacoes SET {', '.join(campos)} WHERE id = %s AND user_id = %s"
                cursor.execute(sql, tuple(valores))
                conn.commit()
                return {'statusCode': 200, 'body': json.dumps({'message': 'Transação atualizada'})}
                
            elif action == 'update_user':
                campos = []
                valores = []
                
                if 'salario_mensal' in body:
                    campos.append("salario_mensal = %s")
                    valores.append(body['salario_mensal'])
                if 'limite_mensal' in body:
                    campos.append("limite_mensal = %s")
                    valores.append(body['limite_mensal'])
                if 'dia_vencimento_fatura' in body:
                    campos.append("dia_vencimento_fatura = %s")
                    valores.append(body['dia_vencimento_fatura'])
                    
                if not campos:
                    return {'statusCode': 400, 'body': json.dumps('Nenhum campo para atualizar no usuário')}
                
                valores.append(user_id)
                sql = f"UPDATE usuarios SET {', '.join(campos)} WHERE id = %s"
                cursor.execute(sql, tuple(valores))
                conn.commit()
                return {'statusCode': 200, 'body': json.dumps({'message': 'Perfil atualizado'})}
                
            else:
                return {'statusCode': 400, 'body': json.dumps('Ação PUT desconhecida')}
    finally:
        conn.close()