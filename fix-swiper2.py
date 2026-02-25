import os

files = ['nunta.html', 'botez.html', 'cununie.html', 'save-the-date.html', 'trash-the-dress.html']

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    css_target = '<link rel="stylesheet" href="style.css">'
    css_insert = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/Swiper/10.3.1/swiper-bundle.min.css">\n    <link rel="stylesheet" href="style.css">'
    
    if 'swiper-bundle.min.css' not in content:
        content = content.replace(css_target, css_insert)
        
    js_target = '<script src="script.js"></script>'
    js_insert = '<script src="https://cdnjs.cloudflare.com/ajax/libs/Swiper/10.3.1/swiper-bundle.min.js"></script>\n    <script src="script.js"></script>'
    
    if 'swiper-bundle.min.js' not in content:
        content = content.replace(js_target, js_insert)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Updated {filepath}")
