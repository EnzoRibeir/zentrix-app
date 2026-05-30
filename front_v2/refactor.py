import os
import glob
import re
import codecs

files = glob.glob(r'c:\Users\Enzo Ribeiro\Desktop\fatec\projetos\zentrix\zentrix-app\front_v2\src\**\*.js', recursive=True)

def process_file(filepath):
    with codecs.open(filepath, 'r', 'utf-8') as f:
        content = f.read()
        
    if 'CORES' not in content:
        return False
        
    # Skip if already refactored
    if 'useTema' in content or 'criarEstilos' in content:
        return False

    original = content
    
    parts = filepath.split(os.sep)
    src_idx = parts.index('src')
    depth = len(parts) - src_idx - 2
    prefix = '../' * depth if depth > 0 else './'
    
    # 1. Update imports
    # If file also uses CORES_SEMANTICAS, we must keep it
    if 'CORES_SEMANTICAS' in original:
        content = re.sub(r'import\s+\{[^}]*CORES[^}]*\}\s+from\s+[\'\"][^\'\"]*cores[\'\"];?', 
                         f'import {{ CORES_SEMANTICAS }} from \'{prefix}constantes/cores\';\nimport {{ useTema }} from \'{prefix}contextos/TemaContexto\';', content)
    else:
        content = re.sub(r'import\s+\{[^}]*CORES[^}]*\}\s+from\s+[\'\"][^\'\"]*cores[\'\"];?', 
                         f'import {{ useTema }} from \'{prefix}contextos/TemaContexto\';', content)

    # 2. Refactor StyleSheet
    content = re.sub(r'const\s+estilos\s*=\s*StyleSheet\.create\(\{', 'const criarEstilos = (CORES) => StyleSheet.create({', content)
    
    # 3. Inject hooks
    comp_match = re.search(r'(const\s+[A-Z]\w+\s*=\s*\([^)]*\)\s*=>\s*\{|export\s+default\s+function\s+[A-Z]\w+\s*\([^)]*\)\s*\{|function\s+[A-Z]\w+\s*\([^)]*\)\s*\{)', content)
    
    if comp_match:
        inject = '\n  const { CORES } = useTema();\n  const estilos = criarEstilos(CORES);\n'
        idx = comp_match.end()
        content = content[:idx] + inject + content[idx:]
    else:
        print('Could not find component in:', filepath)
        return False

    with codecs.open(filepath, 'w', 'utf-8') as f:
        f.write(content)
    return True

changed = 0
for f in files:
    if process_file(f):
        changed += 1
        print('Refactored:', os.path.basename(f))
print('Total files refactored:', changed)
