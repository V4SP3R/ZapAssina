import os
import re

files = [
    'Dashboard_Operacional.html',
    'Despacho_Tatico.html',
    'Motor_Financeiro.html',
    'Triagem_de_Passageiros.html',
    'ZapAssina_Driver_App.html'
]

# Fix: Rotas -> Validacao_Geografica, Logistica -> Despacho_Tatico, Configuracoes -> #
# First, reset all hrefs back to # so we can remap cleanly
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Reset all known page hrefs back to #
    for page in ['Dashboard_Operacional.html', 'Despacho_Tatico.html', 'Motor_Financeiro.html',
                 'Triagem_de_Passageiros.html', 'Validacao_Geografica.html', 'ZapAssina_Driver_App.html']:
        content = content.replace(f'href="{page}"', 'href="#"')

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

# Now apply the correct mapping
mapping = {
    'Dashboard': 'Dashboard_Operacional.html',
    'Rotas': 'Validacao_Geografica.html',
    'Passag.': 'Triagem_de_Passageiros.html',
    'Passageiros': 'Triagem_de_Passageiros.html',
    'Financ.': 'Motor_Financeiro.html',
    'Financeiro': 'Motor_Financeiro.html',
    'Logística': 'Despacho_Tatico.html',
}

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    def repl(m):
        a_tag_content = m.group(0)
        for name, link in mapping.items():
            if re.search(r'>\s*' + re.escape(name) + r'\s*<', a_tag_content):
                return a_tag_content.replace('href="#"', f'href="{link}"')
        return a_tag_content

    new_content = re.sub(r'<a[^>]*href="#"[^>]*>.*?</a>', repl, content, flags=re.DOTALL)

    if content != new_content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {file}')
    else:
        print(f'No changes in {file}')
