// --- 1. إدارة البيانات والسلة ---
let cart = JSON.parse(localStorage.getItem('dandyCart')) || [];

function toggleCart() {
    document.getElementById('side-cart').classList.toggle('active');
}

// تحديث واجهة السلة
function updateCartUI() {
    const container = document.getElementById('cart-items');
    const countLabel = document.getElementById('cart-count');
    const totalLabel = document.getElementById('cart-total');
    
    if(!countLabel) return; // حماية في حال عدم وجود العنصر
    
    countLabel.innerText = cart.length;
    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = '<div style="text-align:center; margin-top:50px; color:#999;">حقيبتك فارغة حالياً 🌸</div>';
        if(totalLabel) totalLabel.innerText = 0;
        return;
    }

    container.innerHTML = cart.map((item, index) => {
        total += parseFloat(item.price);
        return `
            <div class="cart-item" style="display:flex; align-items:center; gap:10px; margin-bottom:15px; border-bottom:1px solid #f9f9f9; padding-bottom:10px;">
                <img src="${item.img}" style="width:50px; height:50px; border-radius:5px; object-fit:cover;">
                <div style="flex:1; text-align:right;">
                    <h5 style="margin:0; font-size:0.9rem;">${item.name}</h5>
                    <span style="color:#ff85a2; font-size:0.8rem;">${item.price} EGP</span>
                </div>
                <i class="fa fa-trash" onclick="removeFromCart(${index})" style="color:#ffb3c1; cursor:pointer;"></i>
            </div>
        `;
    }).join('');
    if(totalLabel) totalLabel.innerText = total;
}

function addToCart(name, price, img) {
    cart.push({ name, price, img });
    localStorage.setItem('dandyCart', JSON.stringify(cart));
    updateCartUI();
    toggleCart(); 
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('dandyCart', JSON.stringify(cart));
    updateCartUI();
}

function sendToWhatsapp() {
    if (cart.length === 0) return alert("السلة فارغة!");
    let msg = "طلب جديد من براند Dandy:%0A-------------------%0A";
    cart.forEach((item, i) => msg += `${i+1}- ${item.name} (${item.price} EGP)%0A`);
    msg += `%0Aالإجمالي: ${document.getElementById('cart-total').innerText} EGP`;
    window.open(`https://wa.me/201097729383?text=${msg}`);
}

// --- وظيفة عرض تفاصيل المنتج (العين) ---
function openProductDetails(id) {
    const allProducts = JSON.parse(localStorage.getItem('dandyProducts')) || [];
    const p = allProducts.find(item => item.id == id);
    
    if(!p) return;

    // إنشاء النافذة المنبثقة
    const modal = document.createElement('div');
    modal.id = 'product-modal';
    modal.style = `
        position: fixed; top:0; left:0; width:100%; height:100%; 
        background: rgba(0,0,0,0.8); z-index: 9999; display: flex; 
        align-items: center; justify-content: center; padding: 20px;
    `;

    modal.innerHTML = `
        <div style="background:white; width:100%; max-width:450px; border-radius:15px; overflow:hidden; position:relative; animation: fadeIn 0.3s ease-in-out;">
            <button onclick="this.parentElement.parentElement.remove()" style="position:absolute; top:10px; left:10px; border:none; background:#eee; border-radius:50%; width:30px; height:30px; cursor:pointer; font-weight:bold;">✕</button>
            <img src="${p.image}" style="width:100%; height:300px; object-fit:cover;">
            <div style="padding:20px; text-align:right;">
                <h2 style="color:#ff85a2; margin:0 0 10px 0;">${p.name}</h2>
                <p style="color:#666; line-height:1.6; font-size:0.95rem; margin-bottom:20px; white-space: pre-wrap;">${p.details || 'لا يوجد وصف مضاف لهذا المنتج حالياً.'}</p>
                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #eee; padding-top:15px;">
                    <span style="font-size:1.3rem; font-weight:bold; color:#2d2d2d;">${p.price} EGP</span>
                    <button onclick="addToCart('${p.name}', ${p.price}, '${p.image}'); document.getElementById('product-modal').remove();" 
                            style="background:#2d2d2d; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer;">
                        إضافة للسلة
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// --- 2. محرك عرض الموقع (تحميل البيانات من الأدمن) ---
function loadWebsiteData() {
    const appearance = JSON.parse(localStorage.getItem('dandyAppearance'));
    if(appearance) {
        const logoImg = document.getElementById('mainLogo');
        if(logoImg && appearance.logo) logoImg.src = appearance.logo;

        const heroSection = document.querySelector('.hero');
        if(heroSection && appearance.bannerImg) {
            heroSection.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${appearance.bannerImg})`;
        }

        if(appearance.text) {
            const bannerTextEl = document.getElementById('banner-text');
            if(bannerTextEl) bannerTextEl.innerText = appearance.text;
        }
    }

    const sections = JSON.parse(localStorage.getItem('dandySections')) || ["الأكثر مبيعاً"];
    const allProducts = JSON.parse(localStorage.getItem('dandyProducts')) || [];
    const mainContainer = document.getElementById('main-content');
    
    if(!mainContainer) return;
    mainContainer.innerHTML = '';

    sections.forEach(secName => {
        const secProducts = allProducts.filter(p => p.section === secName);
        const gridId = `grid-${secName.replace(/\s+/g, '-')}`;

        const sectionHTML = `
            <div class="section-wrapper" style="padding: 40px 8%;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <h3 style="font-size:1.6rem; color:#2d2d2d; border-right:4px solid #ff85a2; padding-right:12px;">${secName}</h3>
                    <div class="arrows">
                        <button onclick="scrollGrid('${gridId}', -1)" style="border:1px solid #eee; background:white; padding:8px 12px; cursor:pointer; border-radius:50%;"><i class="fa fa-chevron-right"></i></button>
                        <button onclick="scrollGrid('${gridId}', 1)" style="border:1px solid #eee; background:white; padding:8px 12px; cursor:pointer; border-radius:50%;"><i class="fa fa-chevron-left"></i></button>
                    </div>
                </div>
                <div class="product-grid" id="${gridId}" style="display:flex; gap:20px; overflow-x:auto; scroll-behavior:smooth; padding-bottom:15px;">
                    ${secProducts.length > 0 ? secProducts.map(p => {
                        const discount = parseFloat(p.discount) || 0;
                        const hasDiscount = discount > 0;
                        
                        return `
                        <div class="product-card" style="min-width:260px; background:white; border:1px solid #f1f1f1; padding:15px; text-align:center; transition:0.3s; position:relative; border-radius:10px;">
                            ${hasDiscount ? `<div style="position:absolute; top:10px; right:10px; background:#ff85a2; color:white; padding:4px 10px; border-radius:5px; font-weight:bold; font-size:0.8rem; z-index:5;">خصم ${discount}%</div>` : ''}
                            <img src="${p.image}" style="width:100%; height:250px; object-fit:cover; border-radius:5px;">
                            <h4 style="margin:15px 0 5px;">${p.name}</h4>
                            <div style="color:#d4af37; font-size:0.8rem;">★★★★★</div>
                            
                            <div style="margin:10px 0;">
                                ${hasDiscount ? `<span style="text-decoration:line-through; color:#999; font-size:0.85rem; margin-left:8px;">${p.oldPrice} EGP</span>` : ''}
                                <span style="font-weight:bold; color:#ff85a2; font-size:1.1rem;">${p.price} EGP</span>
                            </div>

                            <div style="display:flex; gap:10px;">
                                <button onclick="openProductDetails(${p.id})" style="background:#eee; border:none; padding:8px 12px; cursor:pointer; border-radius:4px;"><i class="fa fa-eye"></i></button>
                                <button onclick="addToCart('${p.name}', ${p.price}, '${p.image}')" style="background:#2d2d2d; color:white; border:none; padding:8px 15px; cursor:pointer; flex:1; border-radius:4px;">أضف للسلة</button>
                            </div>
                        </div>
                    `}).join('') : '<p style="color:#ccc; padding-right:10px;">هذا القسم سيحتوي على منتجات داندي قريباً...</p>'}
                </div>
            </div>
        `;
        mainContainer.innerHTML += sectionHTML;
    });
}

// تحريك السلايدر
function scrollGrid(id, direction) {
    const grid = document.getElementById(id);
    if(grid) {
        grid.scrollBy({ left: direction * 300, behavior: 'smooth' });
    }
}

// البحث عن منتج
function searchProduct() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        const name = card.querySelector('h4').innerText.toLowerCase();
        card.style.display = name.includes(term) ? 'block' : 'none';
    });
}

// --- 3. التشغيل عند تحميل الصفحة ---
window.onload = () => {
    loadWebsiteData();
    updateCartUI();
};