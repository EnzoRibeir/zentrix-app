import codecs

file_path = r'c:\Users\Enzo Ribeiro\Desktop\fatec\projetos\zentrix\zentrix-app\back\v8.py'
with codecs.open(file_path, 'r', 'utf-8') as f:
    content = f.read()

# Replace the specific syntax error
bad_string = 'data_check_string = "\n".join(data_check_list)'
good_string = 'data_check_string = "\\n".join(data_check_list)'

content = content.replace(bad_string, good_string)

with codecs.open(file_path, 'w', 'utf-8') as f:
    f.write(content)

import ast
try:
    ast.parse(content)
    print("Syntax OK")
except Exception as e:
    print("Syntax Error:", e)
