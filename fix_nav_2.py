import glob

files = glob.glob('*.html')
files.remove('index.html')

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # We know the contact link has "nav__cta"
    target = '<a href="contact.html" class="nav__cta">Contact</a>'
    replacement = '<a href="video.html" class="nav__link">Video</a>\n            <a href="contact.html" class="nav__cta">Contact</a>'
    
    if 'video.html' not in content and target in content:
        content = content.replace(target, replacement)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print('Fixed: ', file)
    else:
        print('Skipped: ', file)

print('Done completely!')
