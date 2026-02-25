import glob

files = ['nunta.html', 'botez.html', 'cununie.html', 'save-the-date.html', 'trash-the-dress.html']

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add Swiper CSS if not present
    if 'swiper-bundle.min.css' not in content:
        content = content.replace(
            '<link rel="stylesheet" href="style.css">',
            '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/Swiper/10.3.1/swiper-bundle.min.css">\n    <link rel="stylesheet" href="style.css">'
        )
        
    # Add Swiper JS if not present
    if 'swiper-bundle.min.js' not in content:
        content = content.replace(
            '<script src="script.js"></script>',
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/Swiper/10.3.1/swiper-bundle.min.js"></script>\n    <script src="script.js"></script>'
        )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Updated {filepath}")
