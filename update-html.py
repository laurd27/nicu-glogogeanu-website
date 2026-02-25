import glob, re

files = ['nunta.html', 'botez.html', 'cununie.html', 'save-the-date.html', 'trash-the-dress.html']
for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    match = re.search(r'data-category="([a-z-]+)"', content)
    if not match:
        print('Skipping', filepath)
        continue
    category = match.group(1)

    title_match = re.search(r'Album <strong>(.*?)</strong>', content)
    album_title = title_match.group(1) if title_match else category.capitalize()

    # The HTML block to replace
    pattern = re.compile(r'<!-- Right:.*?<div class="portfolio-split__gallery">.*?</div>\s*</div>\s*</div>\s*</section>', re.DOTALL)
    
    new_html = f"""<!-- Right: Featured Slider -->
                <div class="portfolio-split__slider reveal">
                    <div class="swiper portfolio-swiper">
                        <div class="swiper-wrapper" id="portfolioSwiperWrapper">
                            <!-- Slides dynamically injected here -->
                        </div>
                        <div class="swiper-button-prev"></div>
                        <div class="swiper-button-next"></div>
                    </div>
                </div>

            </div>
        </div>
    </section>

    <!-- Full Gallery Section -->
    <section class="section portfolio-gallery">
        <div class="container">
            <div class="section-header reveal">
                <p class="section-header__tag">Album Complet</p>
                <h2 class="section-header__title">{album_title}</h2>
                <div class="section-header__line"></div>
                <div class="album-info__count" style="margin-top:15px; font-size:var(--fs-small); color:var(--text-muted);"></div>
            </div>
            
            <div class="album-grid stagger-children" data-category="{category}">
                <!-- Grid dynamically injected here -->
            </div>
        </div>
    </section>"""
    
    new_content = pattern.sub(new_html, content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Updated', filepath)
