document.addEventListener('DOMContentLoaded', () => {
    console.log("=== 댕냥메디 스크립트 로드 완료 ===");

    // MOCK_PRODUCTS is loaded from products.js

    // 1. 장바구니 및 통계 전역 상태 관리
    let cartItems = [];
    let cartCount = 0;
    let isFirstPurchaseCouponApplied = false;
    let hasEarnedDpCoupon = false; // 댕냥메디페이 결제 시 다음 구매용 쿠폰 획득 여부
    let currentDetailProduct = null;
    let globalConsultCount = 15420; // AI 분석 시마다 1씩 영구 증가할 메모리 상태

    const cartBtn = document.getElementById('cartBtn'); 
    const cartBadge = document.getElementById('cartBadge'); 

    let isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const userProfileWrap = document.getElementById('userProfileWrap');
    const userNickname = document.getElementById('userNickname');

    // 화면 로드 시 로그인 상태이면 프로필 표시
    if (isLoggedIn) {
        if (userProfileWrap) userProfileWrap.style.display = 'flex';
        if (userNickname) userNickname.textContent = '댕냥집사';
    }

    if (cartBtn) {
        cartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!isLoggedIn) {
                window.location.href = 'login.html';
                return;
            }
            // 로그인 상태이면 장바구니 모달 열기
            if (typeof openCartFlowStep === 'function') {
                openCartFlowStep('stepCart', '장바구니', '20%');
            }
        });
    }

    // 2. 상단 햄버거 버튼 (☰) -> 마이페이지/고객센터 메뉴 토글
    const hamburgerBtn = document.querySelector('.icon-btn[aria-label="메뉴"]') || document.querySelector('.hamburger');
    const menuDropdown = document.querySelector('.dropdown-menu');

    if (hamburgerBtn && menuDropdown) {
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            menuDropdown.classList.toggle('active');
            if(petDropdown) petDropdown.classList.remove('active');
        });
    }

    // ===== 통합 검색 분기 로직 =====
    function handleSearch(keyword) {
        // 1. 빈 값 처리
        if (!keyword) {
            alert("검색어를 입력해주세요");
            return;
        }

        const lowerKeyword = keyword.toLowerCase();

        // [시스템 메뉴 분기 - 장바구니 예외 처리 (이전 요구사항 준수)]
        if (lowerKeyword.includes('장바구니') || lowerKeyword.includes('카트') || lowerKeyword.includes('cart')) {
            window.location.href = 'cart.html';
            return;
        }

        // 1. 반려동물 종류 (Pet) 추출
        let pet = 'all';
        const dogKeywords = ['강아지', '댕댕이', '개'];
        const catKeywords = ['고양이', '야옹이', '냥'];
        
        const hasDog = dogKeywords.some(kw => lowerKeyword.includes(kw));
        const hasCat = catKeywords.some(kw => lowerKeyword.includes(kw));

        if (hasDog && !hasCat) {
            pet = 'dog';
        } else if (hasCat && !hasDog) {
            pet = 'cat';
        } else if (hasDog && hasCat) {
            pet = 'all';
        }

        // 2. 건강 카테고리 (Category) 추출
        let category = null;
        const categoryMap = {
            joint: ['관절', '슬개골', '뼈'],
            skin: ['피부', '진정', '모질'],
            eye: ['눈물', '눈병', '안구'],
            gut: ['유산균', '장', '헤어볼'],
            teeth: ['덴탈', '껌', '치석']
        };

        for (const [catKey, keywords] of Object.entries(categoryMap)) {
            if (keywords.some(kw => lowerKeyword.includes(kw))) {
                category = catKey;
                break; // 매칭되는 카테고리가 있으면 할당 후 중단
            }
        }

        // 3. 목적 (Target) 추출
        let target = 'product';
        const guideKeywords = ['가이드', '팁', '정보', '원인', '증상'];
        
        if (guideKeywords.some(kw => lowerKeyword.includes(kw))) {
            target = 'guide';
        }

        // 4. 최종 라우팅 분기 조건에 따른 페이지 이동
        if (target === 'guide' && category) {
            // target이 'guide'이고 건강 카테고리가 매칭되면 (실제 존재하는 health.html로 이동)
            window.location.href = `health.html?pet=${pet}&category=${category}`;
        } else if (target === 'product' && category) {
            // target이 'product'이고 건강 카테고리가 매칭되면 (실제 존재하는 product.html로 이동)
            window.location.href = `product.html?pet=${pet}&category=${category}&search=${encodeURIComponent(keyword)}`;
        } else if (!category && pet !== 'all') {
            // 카테고리는 없지만 특정 동물 전용 상품을 찾으면 (예: 고양이 사료)
            window.location.href = `product.html?pet=${pet}&search=${encodeURIComponent(keyword)}`;
        } else {
            // 그 외 일반 검색어
            window.location.href = `product.html?search=${encodeURIComponent(keyword)}`;
        }
    }

    // 검색 버튼 클릭 이벤트 바인딩
    const searchBtns = document.querySelectorAll('.dl-search-btn, .icon-btn[aria-label="검색"]');
    searchBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const dlInput = document.querySelector('.dl-search input');
            const searchKeyword = dlInput ? dlInput.value.trim() : '';
            handleSearch(searchKeyword);
        });
    });

    // 엔터키 지원 로직 (검색창에서 엔터 입력 시 동일한 로직 실행)
    const searchInputs = document.querySelectorAll('.dl-search input');
    searchInputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch(e.target.value.trim());
            }
        });
    });

    // 해시태그 키워드 마우스 호버 및 클릭 기능
    const hashtags = document.querySelectorAll('.dl-hashtags span');
    hashtags.forEach(tag => {
        // 마우스 호버 시 튀어오르는 애니메이션
        tag.addEventListener('mouseenter', () => {
            tag.style.transform = 'translateY(-5px) scale(1.05)';
            tag.style.color = '#fff';
            tag.style.backgroundColor = '#c97b2e';
            tag.style.borderColor = '#c97b2e';
            tag.style.transition = 'all 0.3s ease';
            tag.style.cursor = 'pointer';
        });
        tag.addEventListener('mouseleave', () => {
            tag.style.transform = '';
            tag.style.color = '';
            tag.style.backgroundColor = '';
            tag.style.borderColor = '';
        });
        // 클릭 시 검색창에 자동 입력 및 검색 실행 (통합 분석 함수 연동)
        tag.addEventListener('click', () => {
            const dlInput = document.querySelector('.dl-search input');
            const keywordText = tag.textContent.replace('#', '').trim();
            if (dlInput) {
                dlInput.value = keywordText;
            }
            // 검색어 분석 및 라우팅 함수 즉시 실행
            handleSearch(keywordText);
        });
    });

    // 3. 강아지/고양이 버튼 (🔽) -> 반려동물 선택 드롭다운 토글 (사용자 커스텀 구조 반영)
    const petBtn = document.getElementById('bannerDropdownBtn'); 
    const petDropdown = document.getElementById('bannerDropdownMenu'); 

    if (petBtn && petDropdown) {
        petBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            petDropdown.style.display = petDropdown.style.display === 'none' ? 'block' : 'none';
            if(menuDropdown) menuDropdown.classList.remove('active');
        });
    }

    // 화면 바깥 클릭 시 모든 메뉴 닫기
    document.addEventListener('click', () => {
        if (menuDropdown) menuDropdown.classList.remove('active');
        if (petDropdown) petDropdown.style.display = 'none';
    });

    // 자동 롤링을 위한 전역 상태
    let eventBannerInterval = null;
    let currentEventIndex = 0;

    // 4. 강아지/고양이 항목 클릭 시 뷰(데이터) 동기화
    function updatePetState(petType) {
        // 관리자 페이지에서 설정한 배너 데이터 가져오기 (없으면 기본값)
        const storedEvents = JSON.parse(localStorage.getItem('adminEventBanners')) || {
            dog: [
                { badge: '🐶 댕댕이 위크', title: '관절 영양제 30% 즉시 할인!', desc: '슬개골 탈구 예방을 위한 필수템', img: 'joint_supplements.png', type: 'dog' },
                { badge: '🔥 타임 특가', title: '인기 덴탈츄 1+1 한정특가', desc: '치석 제거와 입냄새 고민 끝', img: 'dental_care.png', type: 'dog' },
                { badge: '✨ 신상품', title: '천연 성분 피부 진정 샴푸', desc: '가려움 완화, 피부 보습 듬뿍', img: 'dog_shampoo.png', type: 'dog' }
            ],
            cat: [
                { badge: '🐱 냥냥이 위크', title: '헤어볼 케어 영양제 30% 할인!', desc: '헤어볼 배출과 소화기 건강 필수템', img: 'cat_hairball.png', type: 'cat' },
                { badge: '✨ 베스트', title: '기호성 최강 신장 케어 캔', desc: '수분 섭취와 요로 건강을 한 번에', img: 'digestive_care.png', type: 'cat' },
                { badge: '🎁 기획전', title: '지속 가능한 캣타워 할인전', desc: '원목 감성과 내구성을 한 번에', img: 'cat_tower.png', type: 'cat' }
            ]
        };

        const events = storedEvents[petType] || [];
        
        const eventBanner = document.getElementById('eventBanner');
        const eventBadge = document.getElementById('eventBadge');
        const eventTitle = document.getElementById('eventTitle');
        const eventDesc = document.getElementById('eventDesc');
        const eventImg = document.getElementById('eventImg');
        const selectedText = document.getElementById('bannerDropdownSelected');
        const selectDogBtn = document.getElementById('selectDog');
        const selectCatBtn = document.getElementById('selectCat');

        // 상단 드롭다운 UI 상태 변경
        if (petType === 'cat') {
            if(selectedText) selectedText.textContent = '🐱 고양이';
            if(selectCatBtn) selectCatBtn.classList.add('active');
            if(selectDogBtn) selectDogBtn.classList.remove('active');
        } else {
            if(selectedText) selectedText.textContent = '🐶 강아지';
            if(selectDogBtn) selectDogBtn.classList.add('active');
            if(selectCatBtn) selectCatBtn.classList.remove('active');
        }

        // 4-1. 이벤트 배너 텍스트 및 이미지 자동화 (슬라이더 효과)
        if (eventBannerInterval) clearInterval(eventBannerInterval);
        
        function applyEventBanner(eventData) {
            if (!eventBanner) return;
            eventBanner.style.transition = 'opacity 0.3s ease';
            eventBanner.style.opacity = 0;
            
            setTimeout(() => {
                eventBanner.className = eventData.type === 'cat' ? 'event-banner cat-event' : 'event-banner';
                if(eventBadge) eventBadge.textContent = eventData.badge;
                if(eventTitle) eventTitle.textContent = eventData.title;
                if(eventDesc) eventDesc.textContent = eventData.desc;
                if(eventImg) eventImg.src = eventData.img;
                
                eventBanner.style.opacity = 1;
            }, 300);
        }

        if (events.length > 0) {
            currentEventIndex = 0;
            applyEventBanner(events[0]);
            
            if (events.length > 1) {
                eventBannerInterval = setInterval(() => {
                    currentEventIndex = (currentEventIndex + 1) % events.length;
                    applyEventBanner(events[currentEventIndex]);
                }, 4000); // 4초마다 배너 자동 변경
            }
        }
        
        // 4-2. 데이터 전체 렌더링 동기화 호출
        renderView(petType);

        // 클릭 후 메뉴 닫기
        if (petDropdown) petDropdown.style.display = 'none';
    }

    const selectCatBtn = document.getElementById('selectCat');
    const selectDogBtn = document.getElementById('selectDog');

    if (selectCatBtn) {
        selectCatBtn.addEventListener('click', () => {
            updatePetState('cat');
        });
    }
    
    if (selectDogBtn) {
        selectDogBtn.addEventListener('click', () => {
            updatePetState('dog');
        });
    }

    // 5. 잃어버린 배너 데이터 및 가이드 UI 렌더링 함수 복구
    const BANNER_DATA = {
        dog: [
            {
                badge: '🐶 맞춤 솔루션',
                title: '강아지 생애주기별<br>맞춤 영양 케어',
                sub: '나이와 건강 상태에 맞는 필수 영양제',
                hashtags: '#HOT신상 #품절대란템',
                brandTag: '고르고로 브랜드전',
                campaignImage: 'dog_treats.png',
                theme: 'theme-lavender-1'
            },
            {
                badge: '🦷 덴탈케어',
                title: '댕댕이 덴탈츄 특가전<br>치석 제거와 입냄새 고민 끝!',
                sub: '하루 한 개로 깨끗한 치아 관리',
                hashtags: '#치석케어 #오래먹는껌',
                brandTag: '덴탈클린 브랜드전',
                campaignImage: 'dental_care.png',
                theme: 'theme-cream'
            },
            {
                badge: '🛒 신상품',
                title: '프리미엄 펫유모차 출시<br>더 안전하고 부드러운 산책',
                sub: '흔들림 없는 편안함, 원터치 폴딩',
                hashtags: '#부드러운핸들링 #개모차추천',
                brandTag: '에어라이드 디자인전',
                campaignImage: 'pomeranian.png',
                theme: 'theme-cream'
            }
        ],
        cat: [
            {
                badge: '🐱 냥냥케어',
                title: '고양이 생애주기별<br>맞춤 영양 케어',
                sub: '나이와 건강 상태에 맞는 필수 영양제',
                hashtags: '#HOT신상 #품절대란템',
                brandTag: '고르고로 브랜드전',
                campaignImage: 'cat_hairball.png',
                theme: 'theme-orange'
            },
            {
                badge: '✨ 베스트셀러',
                title: '신상 모래 기획전<br>먼지 없는 벤토나이트 최고가 할인',
                sub: '사막화 방지, 강력한 응고력',
                hashtags: '#먼지제로 #고양이모래',
                brandTag: '클린샌드 브랜드전',
                campaignImage: 'cat_treats.png',
                theme: 'theme-orange'
            },
            {
                badge: '🏠 냥테리어',
                title: '지속 가능한 캣타워<br>원목 가구 감성 가득한 공간',
                sub: '튼튼한 내구성과 인테리어 효과',
                hashtags: '#감성인테리어 #튼튼한원목',
                brandTag: '우드펫 가구전',
                campaignImage: 'cat_tower.png',
                theme: 'theme-orange'
            }
        ]
    };

    let bannerSwiper = null;

    function renderView(petType) {
        // 배너 슬라이더 동적 생성
        const wrapper = document.getElementById('bannerSwiperWrapper');
        if (wrapper) {
            const slides = BANNER_DATA[petType] || [];
            wrapper.innerHTML = slides.map(slide => `
              <div class="swiper-slide banner-slide">
                <div class="premium-campaign-card ${slide.theme}">
                  <div class="premium-campaign-text">
                    <div class="banner-slide-badge">${slide.badge}</div>
                    <h2 class="premium-campaign-title">${slide.title}</h2>
                    <p class="premium-campaign-sub">${slide.sub}</p>
                    <div class="premium-campaign-hashtags">${slide.hashtags}</div>
                    <div class="premium-campaign-brand">${slide.brandTag}</div>
                  </div>
                  <div class="premium-campaign-image-wrap">
                    <img src="${slide.campaignImage}" alt="캠페인 상품 이미지" class="premium-campaign-img ${slide.imageClass || ''}" />
                  </div>
                </div>
              </div>
            `).join('');

            // Swiper 재초기화 (자동 슬라이드 및 네비게이션 추가)
            if (bannerSwiper) bannerSwiper.destroy(true, true);
            bannerSwiper = new Swiper('#bannerSwiper', { 
                loop: true, 
                speed: 500,
                autoplay: {
                    delay: 3500,
                    disableOnInteraction: false,
                },
                navigation: {
                    nextEl: '.banner-next',
                    prevEl: '.banner-prev',
                },
                on: {
                    slideChange: function () {
                        const fraction = document.getElementById('bannerFraction');
                        if (fraction) {
                            // loop 모드일 때 realIndex를 사용
                            fraction.textContent = `${this.realIndex + 1}/${slides.length}`;
                        }
                    }
                }
            });
        }

        // 가이드 및 테마 변경
        const headline = document.querySelector('.guide-headline');
        const guideDesc = document.querySelector('.guide-desc');
        const dogImg = document.querySelector('.guide-dog-img');
        const recipeTitle = document.querySelector('#recipeCard .gc-title');
        const kitTitle = document.querySelector('#kitCard .gc-title');
        
        if (petType === 'cat') {
            if (headline) headline.innerHTML = '고양이가 갑자기<br>우다다를 한다면?';
            if (guideDesc) guideDesc.textContent = '원인과 대처법을 알아봐요';
            if (dogImg) { dogImg.src = 'cat_hairball.png'; dogImg.classList.add('cat-mode'); }
            if (recipeTitle) recipeTitle.innerHTML = '헤어볼 방지용<br>캣그라스 키우기';
            if (kitTitle) kitTitle.innerHTML = '초보 집사 필수<br>기초 상식 테스트';
            document.querySelector('.app')?.classList.add('cat-mode');
        } else {
            if (headline) headline.innerHTML = '강아지가 갑자기<br>발을 핥는다면?';
            if (guideDesc) guideDesc.textContent = '원인과 해결법을 알아봐요';
            if (dogImg) { dogImg.src = 'pomeranian.png'; dogImg.classList.remove('cat-mode'); }
            if (recipeTitle) recipeTitle.innerHTML = '여름철 기력 회복<br>특식 레시피';
            if (kitTitle) kitTitle.innerHTML = '우리 집 비상약<br>체크리스트';
            document.querySelector('.app')?.classList.remove('cat-mode');
        }

        // 3. 증상 카테고리 모듈 동기화
        const SYMPTOM_CATEGORIES = {
            dog: [
                { label: '관절 케어', emoji: '🦴', tooltip: '슬개골 탈구 예방' },
                { label: '눈물/눈병', emoji: '👁️', tooltip: '반짝이는 눈망울' },
                { label: '피부/보송', emoji: '🌿', tooltip: '가려움 안녕!' },
                { label: '면역력 UP', emoji: '💪', tooltip: '튼튼한 기초 체력' },
                { label: '구강/치석', emoji: '🦷', tooltip: '입냄새 싹~' }
            ],
            cat: [
                { label: '헤어볼/소화', emoji: '🧶', tooltip: '헤어볼 안녕' },
                { label: '신장/요로', emoji: '💧', tooltip: '원활한 배뇨' },
                { label: '피부/모질', emoji: '✨', tooltip: '윤기나는 털' },
                { label: '면역력 UP', emoji: '💪', tooltip: '튼튼한 기초 체력' },
                { label: '구강/치석', emoji: '🦷', tooltip: '튼튼한 치아' }
            ]
        };

        const symptomsContainer = document.querySelector('.symptoms-row');
        if (symptomsContainer) {
            const categories = SYMPTOM_CATEGORIES[petType] || [];
            
            let activeLabel = '피부/보송';
            const currentActiveBtn = symptomsContainer.querySelector('.sym-icon.active');
            if (currentActiveBtn) {
                const parent = currentActiveBtn.closest('.sym-item');
                if (parent) activeLabel = parent.dataset.label;
            }
            
            // 토글 호환 매핑
            if (petType === 'cat' && activeLabel === '관절 케어') activeLabel = '헤어볼/소화';
            if (petType === 'dog' && (activeLabel === '헤어볼 케어' || activeLabel === '헤어볼/소화')) activeLabel = '관절 케어';
            if (activeLabel === '구강 케어') activeLabel = '구강/치석';

            symptomsContainer.innerHTML = categories.map(cat => {
                const isActive = cat.label === activeLabel;
                return `
                    <div class="sym-item" data-label="${cat.label}">
                        <div class="category-tooltip">${cat.tooltip}</div>
                        <button class="sym-icon ${isActive ? 'active' : ''}">${cat.emoji}</button>
                        <span class="sym-label">${cat.label}</span>
                    </div>
                `;
            }).join('');
            
            // 재생성된 아이콘들에 클릭 이벤트 다시 달기
            symptomsContainer.querySelectorAll('.sym-item').forEach(item => {
                item.addEventListener('click', () => {
                    symptomsContainer.querySelectorAll('.sym-icon').forEach(b => b.classList.remove('active'));
                    const btn = item.querySelector('.sym-icon');
                    if (btn) btn.classList.add('active');
                    
                    // 상세 페이지 오버레이 열기 및 홈 뷰 완벽 숨김 처리
                    const label = item.dataset.label;
                    openProductDetail(label);
                });
            });
        }
    }

    // 화면 로드 시 초기 렌더링 실행 (기본 강아지 모드로 배너 자동 롤링 시작)
    updatePetState('dog');

    // ===== 6. 챗봇 상담 기능 구현 =====
    const chatbotBannerBtn = document.getElementById('chatbotBannerBtn');
    const chatbotFab = document.getElementById('chatbotFab');
    const chatbotOverlay = document.getElementById('chatbotOverlay');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const chatbotCloseBtn = document.getElementById('chatbotCloseBtn');
    const chatbotMessages = document.getElementById('chatbotMessages');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSendBtn = document.getElementById('chatbotSendBtn');

    function openChatbot() {
        if (chatbotOverlay && chatbotWindow) {
            chatbotOverlay.classList.add('active');
            chatbotWindow.classList.add('active');
            
            // 첫 진입 시 환영 메시지 (메시지가 없을 때만)
            if (chatbotMessages && chatbotMessages.children.length === 0) {
                setTimeout(() => {
                    addChatMessage('안녕하세요! 댕냥메디 AI 상담원입니다. 🐾', 'bot');
                    setTimeout(() => {
                        addChatMessage('우리 아이의 어떤 증상이 걱정되시나요?\n(예: "강아지가 자꾸 발을 핥아요", "고양이가 헤어볼을 토해요")', 'bot');
                    }, 500);
                }, 300);
            }
        }
    }

    function closeChatbot() {
        if (chatbotOverlay && chatbotWindow) {
            chatbotOverlay.classList.remove('active');
            chatbotWindow.classList.remove('active');
        }
    }

    if (chatbotBannerBtn) chatbotBannerBtn.addEventListener('click', openChatbot);
    if (chatbotFab) chatbotFab.addEventListener('click', openChatbot);
    if (chatbotCloseBtn) chatbotCloseBtn.addEventListener('click', closeChatbot);
    if (chatbotOverlay) chatbotOverlay.addEventListener('click', closeChatbot);

    function openProductDetail(label) {
        const productsList = MOCK_PRODUCTS[label] || MOCK_PRODUCTS['면역력 UP'];
        const appContainer = document.querySelector('.app');
        if (appContainer) {
            const headerTitle = document.getElementById('detailHeaderTitle');
            if (headerTitle) headerTitle.textContent = `${label} 상품`;

            const listContainer = document.getElementById('detailProductList');
            const infoContainer = document.getElementById('detailProductInfo');
            const actionBar = document.querySelector('.detail-action-bar');

            if (listContainer && infoContainer) {
                listContainer.style.display = 'block';
                infoContainer.style.display = 'none';
                if (actionBar) actionBar.style.display = 'none';

                listContainer.innerHTML = `
                    <div style="display:flex; flex-direction:column; gap:16px;">
                        ${productsList.map((prod, idx) => {
                            const currentPriceInt = parseInt(prod.price.replace(/,/g, ''));
                            const discountInt = parseInt(prod.discount);
                            let originalPriceHtml = '';
                            if (!isNaN(currentPriceInt) && !isNaN(discountInt) && discountInt > 0) {
                                const originalPriceInt = Math.round(currentPriceInt / (1 - (discountInt / 100)));
                                const roundedOriginal = Math.round(originalPriceInt / 100) * 100;
                                originalPriceHtml = `<span style="font-size:12px; color:#c4b5a8; text-decoration:line-through; margin-left:4px;">${roundedOriginal.toLocaleString()}원</span>`;
                            }

                            return `
                            <div class="product-item-card" onclick="showSpecificProductDetail(${JSON.stringify(prod).replace(/"/g, '&quot;')}, '${label}')" 
                                 style="position:relative; display:flex; gap:14px; background:#fff; border:none; border-radius:18px; padding:16px; cursor:pointer; box-shadow:0 8px 24px rgba(61,44,30,0.06); transition:all 0.3s cubic-bezier(0.25,0.46,0.45,0.94);">
                                <div style="width:84px; height:84px; border-radius:14px; overflow:hidden; background:#faf7f2; flex-shrink:0;">
                                    <img src="${prod.img}" style="width:100%; height:100%; object-fit:cover;">
                                </div>
                                <div style="display:flex; flex-direction:column; justify-content:space-between; flex:1; padding-right: 32px;">
                                    <div>
                                        <div style="display:flex; gap:6px; margin-bottom:6px;">
                                            ${idx === 0 ? `<span style="font-size:10px; font-weight:800; color:#c97b2e; background:#fff3e6; padding:3px 8px; border-radius:6px;">베스트</span>` : ''}
                                        </div>
                                        <h3 style="font-size:14px; font-weight:800; color:#3d2c1e; margin:0 0 6px 0; line-height:1.4;">${prod.name}</h3>
                                    </div>
                                    <div style="display:flex; align-items:baseline; gap:6px;">
                                        <span style="font-size:13px; font-weight:800; color:#e87a7a;">${prod.discount} 할인</span>
                                        <span style="font-size:16px; font-weight:800; color:#3d2c1e;">${prod.price}</span>
                                        ${originalPriceHtml}
                                    </div>
                                </div>
                            </div>
                        `}).join('')}
                    </div>
                `;

                const cards = listContainer.querySelectorAll('.product-item-card');
                cards.forEach(card => {
                    card.addEventListener('mouseenter', () => {
                        card.style.transform = 'translateY(-4px)';
                        card.style.boxShadow = '0 12px 32px rgba(216,131,115,0.12)';
                    });
                    card.addEventListener('mouseleave', () => {
                        card.style.transform = 'translateY(0)';
                        card.style.boxShadow = '0 8px 24px rgba(61,44,30,0.06)';
                    });
                });
            }

            const detailCloseBtn = document.getElementById('detailCloseBtn');
            if (detailCloseBtn) {
                const newCloseBtn = detailCloseBtn.cloneNode(true);
                detailCloseBtn.parentNode.replaceChild(newCloseBtn, detailCloseBtn);
                newCloseBtn.addEventListener('click', () => {
                    appContainer.classList.remove('hide-home');
                    appContainer.style.overflowY = ''; // 스크롤 복원
                });
            }

            // 스크롤 최상단으로 리셋 후 상세창 표시
            appContainer.scrollTop = 0;
            window.scrollTo(0, 0);
            appContainer.style.overflowY = 'hidden'; // 상세 뷰에서 앱 스크롤 잠금
            appContainer.classList.add('hide-home');
        }
    }

    window.addQuickCart = function(product) {
        cartItems.push({ ...product, qty: 1, checked: true });
        cartCount = cartItems.length;
        const cartBadge = document.getElementById('cartBadge');
        if (cartBadge) cartBadge.textContent = cartCount;
        if (typeof renderCartItems === 'function') renderCartItems();
        
        // 간단한 토스트 팝업 또는 알림
        const toast = document.createElement('div');
        toast.textContent = '장바구니에 담겼습니다.';
        toast.style.cssText = 'position:fixed; bottom:80px; left:50%; transform:translateX(-50%); background:rgba(61,44,30,0.85); color:#fff; padding:12px 24px; border-radius:30px; font-size:14px; font-weight:700; z-index:99999; box-shadow:0 8px 24px rgba(0,0,0,0.15); opacity:0; transition:opacity 0.3s;';
        document.body.appendChild(toast);
        setTimeout(() => toast.style.opacity = '1', 10);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    };

    window.showSpecificProductDetail = function(product, categoryLabel) {
        currentDetailProduct = product;
        const appContainer = document.querySelector('.app');
        if (appContainer) {
            const headerTitle = document.getElementById('detailHeaderTitle');
            if (headerTitle) headerTitle.textContent = `상품 상세`;

            const listContainer = document.getElementById('detailProductList');
            const infoContainer = document.getElementById('detailProductInfo');
            const actionBar = document.querySelector('.detail-action-bar');

            if (listContainer && infoContainer) {
                listContainer.style.display = 'none';
                infoContainer.style.display = 'block';
                if (actionBar) actionBar.style.display = 'flex';

                document.getElementById('detailCategory').textContent = categoryLabel;
                document.getElementById('detailName').textContent = product.name;
                document.getElementById('detailPrice').textContent = product.price;
                document.getElementById('detailDiscount').textContent = product.discount;
                document.getElementById('detailDesc').textContent = product.desc;
                document.getElementById('detailImage').style.backgroundImage = `url(${product.img})`;
                
                const detailDeepDiveImg = document.getElementById('detailDeepDiveImg');
                if (detailDeepDiveImg) detailDeepDiveImg.src = product.deepDiveImg || product.img;

                const detailIngredients = document.getElementById('detailIngredients');
                if (detailIngredients && product.ingredients) {
                    detailIngredients.innerHTML = product.ingredients.map(ing => `
                      <div class="ing-card">
                        <div class="ing-icon">${ing.icon}</div>
                        <div class="ing-name">${ing.name}</div>
                        <div class="ing-desc">${ing.desc}</div>
                      </div>
                    `).join('');
                }

                const detailRecommend = document.getElementById('detailRecommend');
                if (detailRecommend && product.recommend) {
                    detailRecommend.innerHTML = product.recommend.map(rec => `<li>${rec}</li>`).join('');
                }

                const featureGrid = document.querySelector('.feature-grid');
                if (featureGrid && product.features) {
                    featureGrid.innerHTML = product.features.map(feat => `
                      <div class="feature-item"><span class="check-icon">✔</span> ${feat}</div>
                    `).join('');
                }
            }

            const detailCloseBtn = document.getElementById('detailCloseBtn');
            if (detailCloseBtn) {
                const newCloseBtn = detailCloseBtn.cloneNode(true);
                detailCloseBtn.parentNode.replaceChild(newCloseBtn, detailCloseBtn);
                newCloseBtn.addEventListener('click', () => {
                    openProductDetail(categoryLabel);
                });
            }
        }
    }

    function goToClinicTab() {
        const clinicTabBtn = Array.from(document.querySelectorAll('.bottom-nav .nav-item')).find(el => el.dataset.page === '클리닉');
        if (clinicTabBtn) {
            clinicTabBtn.click();
        }
    }

    function openCartFlowStep(stepId, title, progressWidth) {
        const cartFlowModal = document.getElementById('cartFlowModal');
        const targetStep = document.getElementById(stepId);
        const cartPageTitle = document.getElementById('cartPageTitle');
        const cartProgressFill = document.getElementById('cartProgressFill');

        if (cartFlowModal && targetStep) {
            const allSteps = cartFlowModal.querySelectorAll('.flow-step');
            allSteps.forEach(step => {
                step.classList.remove('page-active', 'page-prev');
                step.classList.add('hidden');
            });

            targetStep.classList.remove('hidden');
            targetStep.classList.add('page-active');

            if (cartPageTitle) cartPageTitle.textContent = title;
            if (cartProgressFill) cartProgressFill.style.width = progressWidth;

            cartFlowModal.classList.add('active');
        }
    }

    let deliveryInterval = null;
    function openDeliveryTracking() {
        openCartFlowStep('stepDelivery', '배송 조회', '100%');
        
        const statusMain = document.querySelector('.delivery-status-box .status-main');
        const timelineItems = document.querySelectorAll('.delivery-timeline .timeline-item');
        
        if (statusMain && timelineItems.length >= 4) {
            // 초기화
            statusMain.textContent = '상품 배송 준비중';
            timelineItems.forEach(item => item.classList.remove('active'));
            timelineItems[0].classList.add('active'); // 주문 완료
            
            if (deliveryInterval) clearInterval(deliveryInterval);
            
            let step = 1;
            deliveryInterval = setInterval(() => {
                if (step < timelineItems.length) {
                    timelineItems[step].classList.add('active');
                    
                    if (step === 1) {
                        statusMain.textContent = '상품 준비중';
                    } else if (step === 2) {
                        statusMain.textContent = '배송 시작';
                    } else if (step === 3) {
                        statusMain.textContent = '배송 완료';
                    }
                    step++;
                } else {
                    clearInterval(deliveryInterval);
                }
            }, 1200); // 1.2초마다 업데이트
        }
    }

    function closeCartFlowModal() {
        const cartFlowModal = document.getElementById('cartFlowModal');
        if (cartFlowModal) cartFlowModal.classList.remove('active');
    }

    // 장바구니/결제 흐름 (플로우 내비게이션 버튼들)
    const cartNextBtn = document.getElementById('cartNextBtn');
    if (cartNextBtn) cartNextBtn.addEventListener('click', () => {
        if (cartItems.length === 0) {
            alert('장바구니가 비어있습니다. 상품을 담아주세요.');
            return;
        }
        openCartFlowStep('stepCheckout', '주문/결제', '40%');
    });

    // 댕냥메디페이 상태 관리
    let isDpRegistered = false;

    // 결제 수단 선택 로직
    const payMethodBtns = document.querySelectorAll('.pay-method-btn');
    const generalSubMethods = document.getElementById('generalSubMethods');
    const subMethodBtns = document.querySelectorAll('.sub-method-btn');
    const generalPaymentForm = document.getElementById('generalPaymentForm');
    const bankSelectionForm = document.getElementById('bankSelectionForm');
    const daengnyangPaySection = document.getElementById('daengnyangPaySection');
    const mobilePaymentForm = document.getElementById('mobilePaymentForm');
    
    payMethodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            payMethodBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 무통장입금 폼 토글
            if (btn.dataset.method === 'bank') {
                if (bankSelectionForm) bankSelectionForm.style.display = 'block';
            } else {
                if (bankSelectionForm) bankSelectionForm.style.display = 'none';
            }
            
            // 댕냥메디페이 폼 토글
            if (btn.dataset.method === 'daengnyang') {
                if (daengnyangPaySection) daengnyangPaySection.style.display = 'block';
            } else {
                if (daengnyangPaySection) daengnyangPaySection.style.display = 'none';
            }
            
            // 휴대폰 결제 폼 토글
            if (btn.dataset.method === 'mobile') {
                if (mobilePaymentForm) mobilePaymentForm.style.display = 'block';
            } else {
                if (mobilePaymentForm) mobilePaymentForm.style.display = 'none';
            }
            
            if (btn.dataset.method === 'general') {
                if (generalSubMethods) generalSubMethods.style.display = 'block';
                const activeSub = document.querySelector('.sub-method-btn.active');
                if (activeSub && activeSub.dataset.sub === 'direct') {
                    if (generalPaymentForm) generalPaymentForm.style.display = 'block';
                } else {
                    if (generalPaymentForm) generalPaymentForm.style.display = 'none';
                }
            } else {
                if (generalSubMethods) generalSubMethods.style.display = 'none';
                if (generalPaymentForm) generalPaymentForm.style.display = 'none';
            }
            
            // 결제 수단이 변경될 때마다 카트 리렌더링 (할인 실시간 반영용)
            if (typeof renderCartItems === 'function') {
                renderCartItems();
            }
        });
    });

    subMethodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            subMethodBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (btn.dataset.sub === 'direct') {
                if (generalPaymentForm) generalPaymentForm.style.display = 'block';
            } else {
                if (generalPaymentForm) generalPaymentForm.style.display = 'none';
            }

            // 토스페이 버튼 클릭 즉시 SDK 호출
            if (btn.dataset.sub === 'toss') {
                const tossPayments = TossPayments("test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq");
                let payAmount = 50000;
                const priceEl = document.getElementById('checkoutTotalPrice');
                if (priceEl) {
                    const parsed = parseInt(priceEl.textContent.replace(/[^0-9]/g, ''));
                    if (!isNaN(parsed) && parsed > 0) payAmount = parsed;
                }
                
                tossPayments.requestPayment('카드', {
                    amount: payAmount,
                    orderId: 'TOSS_' + new Date().getTime(),
                    orderName: '댕냥메디 상품 결제',
                    customerName: document.getElementById('chkName') ? document.getElementById('chkName').value || '고객님' : '고객님',
                    successUrl: window.location.origin + window.location.pathname + '?payment=success',
                    failUrl: window.location.origin + window.location.pathname + '?payment=fail',
                }).catch(function (error) {
                    if (error.code === 'USER_CANCEL') {
                        alert('결제를 취소하셨습니다.');
                    } else {
                        alert('결제창 오픈 실패: ' + error.message);
                    }
                });
            }
        });
    });

    const cameraScanBtn = document.getElementById('cameraScanBtn');
    const cameraScanModal = document.getElementById('cameraScanModal');
    const cameraVideo = document.getElementById('cameraVideo');
    const cameraCloseBtn = document.getElementById('cameraCloseBtn');
    const cameraCaptureBtn = document.getElementById('cameraCaptureBtn');
    let stream = null;

    if (cameraScanBtn) {
        cameraScanBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (cameraScanModal) cameraScanModal.style.display = 'flex';
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (cameraVideo) cameraVideo.srcObject = stream;
            } catch (err) {
                console.warn('카메라 접근 불가:', err);
                alert('카메라 접근 권한이 없거나 지원하지 않는 기기입니다. 직접 입력해주세요.');
            }
        });
    }

    const closeCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        if (cameraScanModal) cameraScanModal.style.display = 'none';
    };

    if (cameraCloseBtn) cameraCloseBtn.addEventListener('click', closeCamera);
    if (cameraCaptureBtn) {
        cameraCaptureBtn.addEventListener('click', () => {
            closeCamera();
            // 스캔 완료 후 폼 자동 채우기
            if (generalPaymentForm) {
                const inputs = generalPaymentForm.querySelectorAll('.auth-input');
                if(inputs.length >= 6) {
                    inputs[0].value = '1234';
                    inputs[1].value = '5678';
                    inputs[2].value = '9012';
                    inputs[3].value = '3456';
                    inputs[4].value = '1228';
                    inputs[5].value = '123';
                }
            }
        });
    }

    const checkoutPrevBtn = document.getElementById('checkoutPrevBtn');
    if (checkoutPrevBtn) checkoutPrevBtn.addEventListener('click', () => openCartFlowStep('stepCart', '장바구니', '20%'));

    const processPaymentSuccess = () => {
        const activeMethod = document.querySelector('.pay-method-btn.active');
        const isDaengnyang = activeMethod && activeMethod.dataset.method === 'daengnyang';
        
        // 댕냥메디페이 결제 시 다음 구매를 위한 쿠폰 지급
        if (isDaengnyang && !hasEarnedDpCoupon) {
            hasEarnedDpCoupon = true;
            const dpCouponWrap = document.getElementById('dpCouponWrap');
            if (dpCouponWrap) dpCouponWrap.style.display = 'flex';
        }

        openCartFlowStep('stepSuccess', '결제 완료', '60%');
        
        // 배송 정보 및 총 결제금액 주문 상세 페이지 동기화
        const chkNameInput = document.getElementById('chkName');
        const chkPhoneInput = document.getElementById('chkPhone');
        const chkAddressInput = document.getElementById('chkAddress');
        const chkAddressDetailInput = document.getElementById('chkAddressDetail');
        const detailReceiver = document.getElementById('detailReceiver');
        const detailPhone = document.getElementById('detailPhone');
        const detailAddress = document.getElementById('detailAddress');
        const checkoutTotalPrice = document.getElementById('checkoutTotalPrice');
        const detailTotal = document.getElementById('detailTotal');

        if (detailReceiver) detailReceiver.textContent = (chkNameInput && chkNameInput.value.trim() !== '') ? chkNameInput.value : '홍길동';
        if (detailPhone) detailPhone.textContent = (chkPhoneInput && chkPhoneInput.value.trim() !== '') ? chkPhoneInput.value : '010-1234-5678';
        
        let fullAddress = '서울특별시 강남구 테헤란로 123';
        if (chkAddressInput && chkAddressInput.value.trim() !== '') {
            fullAddress = chkAddressInput.value;
            if (chkAddressDetailInput && chkAddressDetailInput.value.trim() !== '') {
                fullAddress += ' ' + chkAddressDetailInput.value;
            }
        }
        if (detailAddress) detailAddress.textContent = fullAddress;
        if (detailTotal && checkoutTotalPrice) {
            detailTotal.textContent = checkoutTotalPrice.textContent;
        }

        cartItems = [];
        cartCount = 0;
        const cartBadge = document.getElementById('cartBadge');
        if (cartBadge) cartBadge.textContent = '0';
        renderCartItems();
    };

    const checkoutNextBtn = document.getElementById('checkoutNextBtn');
    if (checkoutNextBtn) checkoutNextBtn.addEventListener('click', () => {
        const activeMethod = document.querySelector('.pay-method-btn.active');
        const activeSub = document.querySelector('.sub-method-btn.active');
        
        const isGeneralDirect = activeMethod && activeMethod.dataset.method === 'general' && activeSub && activeSub.dataset.sub === 'direct';
        const isTossPay = activeMethod && activeMethod.dataset.method === 'general' && activeSub && activeSub.dataset.sub === 'toss';
        const isBank = activeMethod && activeMethod.dataset.method === 'bank';
        const isDaengnyang = activeMethod && activeMethod.dataset.method === 'daengnyang';
        const isMobile = activeMethod && activeMethod.dataset.method === 'mobile';
        
        // 댕냥메디페이 결제 진행
        if (isDaengnyang) {
            if (!isDpRegistered) {
                alert('댕냥메디페이 카드를 먼저 등록해주세요.');
            } else {
                const dpAuthPwInput = document.getElementById('dpAuthPwInput');
                const dpPwAuthModal = document.getElementById('dpPwAuthModal');
                if (dpAuthPwInput) dpAuthPwInput.value = '';
                if (dpPwAuthModal) dpPwAuthModal.style.display = 'flex';
            }
            return;
        }

        // 휴대폰 결제 진행
        if (isMobile) {
            const telecomSelect = document.getElementById('telecomSelect');
            const mobilePhoneInput = document.getElementById('mobilePhoneInput');
            const mobileAuthCodeInput = document.getElementById('mobileAuthCodeInput');
            const mobileAuthCodeField = document.getElementById('mobileAuthCodeField');
            
            if (!telecomSelect || !telecomSelect.value) {
                alert('통신사를 선택해주세요.');
                return;
            }
            if (!mobilePhoneInput || !mobilePhoneInput.value) {
                alert('휴대폰 번호를 입력해주세요.');
                return;
            }
            if (mobileAuthCodeField && mobileAuthCodeField.style.display === 'none') {
                alert('인증번호 전송 버튼을 눌러주세요.');
                return;
            }
            if (!mobileAuthCodeInput || mobileAuthCodeInput.value.length === 0) {
                alert('인증번호 6자리를 입력해주세요.');
                return;
            }
            
            // 인증번호 검증 (테스트 코드: 123456)
            if (mobileAuthCodeInput.value !== '123456') {
                alert('인증번호가 일치하지 않습니다.\n올바른 번호를 입력해주세요. (테스트용: 123456)');
                return;
            }
            
            // 휴대폰 결제 성공
            alert('휴대폰 결제 인증이 완료되었습니다.');
            processPaymentSuccess();
            return;
        }

        // 토스페이는 위젯/버튼 즉시 클릭으로 처리하므로, 여기서는 패스하거나 알럿 처리
        if (isTossPay) {
            alert('토스페이 결제는 위의 [💙 토스페이] 버튼을 직접 눌러 진행해주세요.');
            return;
        }

        if (isBank) {
            const bankSelect = document.getElementById('bankSelect');
            if (bankSelect && bankSelect.value === '') {
                alert('입금하실 은행을 선택해주세요.');
                return;
            }
            
            const virtualAccountModal = document.getElementById('virtualAccountModal');
            const vaBankName = document.getElementById('vaBankName');
            const vaAccountNumber = document.getElementById('vaAccountNumber');
            
            if (virtualAccountModal) {
                // 선택한 은행에 맞는 가상계좌 생성 (테스트)
                const banks = {
                    '신한은행': '110-' + Math.floor(100+Math.random()*900) + '-' + Math.floor(100000+Math.random()*900000),
                    '국민은행': '123456-' + Math.floor(10+Math.random()*90) + '-' + Math.floor(100000+Math.random()*900000),
                    '하나은행': '123-' + Math.floor(100000+Math.random()*900000) + '-' + Math.floor(100+Math.random()*900)
                };
                const selBank = bankSelect.value || '신한은행';
                
                if (vaBankName) vaBankName.textContent = selBank;
                if (vaAccountNumber) vaAccountNumber.textContent = banks[selBank] || '000-000-000000';
                
                virtualAccountModal.style.display = 'flex';
            }
            return;
        }

        if (isGeneralDirect) {
            const cardPwInput = document.getElementById('cardPwInput');
            if (cardPwInput) cardPwInput.value = '';
            const pwModal = document.getElementById('cardPasswordModal');
            if (pwModal) pwModal.style.display = 'flex';
        } else {
            processPaymentSuccess();
        }
    });

    const cardPwCancelBtn = document.getElementById('cardPwCancelBtn');
    const cardPwConfirmBtn = document.getElementById('cardPwConfirmBtn');
    const cardPasswordModal = document.getElementById('cardPasswordModal');
    const cardApprovalModal = document.getElementById('cardApprovalModal');
    const cardApprovalConfirmBtn = document.getElementById('cardApprovalConfirmBtn');
    
    if (cardPwCancelBtn) cardPwCancelBtn.addEventListener('click', () => {
        if (cardPasswordModal) cardPasswordModal.style.display = 'none';
    });

    if (cardPwConfirmBtn) cardPwConfirmBtn.addEventListener('click', () => {
        const cardPwInput = document.getElementById('cardPwInput');
        if (cardPwInput && (cardPwInput.value.length === 4 || cardPwInput.value.length === 6)) {
            if (cardPasswordModal) cardPasswordModal.style.display = 'none';
            if (cardApprovalModal) cardApprovalModal.style.display = 'flex';
        } else {
            alert('결제 비밀번호 4자리 또는 6자리를 정확히 입력해주세요.');
        }
    });

    if (cardApprovalConfirmBtn) cardApprovalConfirmBtn.addEventListener('click', () => {
        if (cardApprovalModal) cardApprovalModal.style.display = 'none';
        processPaymentSuccess();
    });

    const virtualAccountConfirmBtn = document.getElementById('virtualAccountConfirmBtn');
    const virtualAccountModal = document.getElementById('virtualAccountModal');
    if (virtualAccountConfirmBtn) {
        virtualAccountConfirmBtn.addEventListener('click', () => {
            if (virtualAccountModal) virtualAccountModal.style.display = 'none';
            processPaymentSuccess();
        });
    }

    // 휴대폰 결제 인증번호 전송 로직
    const mobileAuthRequestBtn = document.getElementById('mobileAuthRequestBtn');
    const mobileAuthCodeField = document.getElementById('mobileAuthCodeField');
    const mobilePhoneInput = document.getElementById('mobilePhoneInput');
    const telecomSelect = document.getElementById('telecomSelect');
    
    if (mobileAuthRequestBtn) {
        mobileAuthRequestBtn.addEventListener('click', () => {
            if (!telecomSelect || !telecomSelect.value) {
                alert('통신사를 먼저 선택해주세요.');
                return;
            }
            if (!mobilePhoneInput || !mobilePhoneInput.value) {
                alert('휴대폰 번호를 입력해주세요.');
                return;
            }
            
            alert('인증번호가 전송되었습니다.\n(테스트용 인증번호: 123456)');
            if (mobileAuthCodeField) {
                mobileAuthCodeField.style.display = 'block';
            }
        });
    }

    // 댕냥메디페이 모달 이벤트
    const dpRegisterCardBtn = document.getElementById('dpRegisterCardBtn');
    const dpCardRegisterModal = document.getElementById('dpCardRegisterModal');
    const dpCardRegisterCloseBtn = document.getElementById('dpCardRegisterCloseBtn');
    const dpCardRegisterNextBtn = document.getElementById('dpCardRegisterNextBtn');

    if (dpRegisterCardBtn) {
        dpRegisterCardBtn.addEventListener('click', () => {
            if (dpCardRegisterModal) dpCardRegisterModal.style.display = 'flex';
        });
    }

    if (dpCardRegisterCloseBtn) {
        dpCardRegisterCloseBtn.addEventListener('click', () => {
            if (dpCardRegisterModal) dpCardRegisterModal.style.display = 'none';
        });
    }

    const dpPwSetupModal = document.getElementById('dpPwSetupModal');
    const dpSetupPwInput = document.getElementById('dpSetupPwInput');
    const dpPwSetupConfirmBtn = document.getElementById('dpPwSetupConfirmBtn');

    if (dpCardRegisterNextBtn) {
        dpCardRegisterNextBtn.addEventListener('click', () => {
            if (dpCardRegisterModal) dpCardRegisterModal.style.display = 'none';
            if (dpPwSetupModal) {
                dpPwSetupModal.style.display = 'flex';
                if (dpSetupPwInput) dpSetupPwInput.value = '';
            }
        });
    }

    const dpUnregistered = document.getElementById('dpUnregistered');
    const dpRegistered = document.getElementById('dpRegistered');

    if (dpPwSetupConfirmBtn) {
        dpPwSetupConfirmBtn.addEventListener('click', () => {
            if (dpSetupPwInput && dpSetupPwInput.value.length === 6) {
                if (dpPwSetupModal) dpPwSetupModal.style.display = 'none';
                isDpRegistered = true;
                if (dpUnregistered) dpUnregistered.style.display = 'none';
                if (dpRegistered) dpRegistered.style.display = 'block';
                alert('댕냥메디페이 결제 비밀번호 설정이 완료되었습니다!\n(테스트용 빌링키가 성공적으로 연동되었습니다.)\n\n🎁 이번 결제를 완료하시면 다음 구매 시 사용할 수 있는 5,000원 쿠폰이 지급됩니다!');
            } else {
                alert('결제 비밀번호 6자리를 모두 입력해주세요.');
            }
        });
    }

    const dpPwAuthModal = document.getElementById('dpPwAuthModal');
    const dpAuthPwInput = document.getElementById('dpAuthPwInput');
    const dpPwAuthCloseBtn = document.getElementById('dpPwAuthCloseBtn');
    const dpPwAuthConfirmBtn = document.getElementById('dpPwAuthConfirmBtn');

    if (dpPwAuthCloseBtn) {
        dpPwAuthCloseBtn.addEventListener('click', () => {
            if (dpPwAuthModal) dpPwAuthModal.style.display = 'none';
        });
    }

    if (dpPwAuthConfirmBtn) {
        dpPwAuthConfirmBtn.addEventListener('click', () => {
            if (dpAuthPwInput && dpAuthPwInput.value.length === 6) {
                if (dpPwAuthModal) dpPwAuthModal.style.display = 'none';
                // 간편결제 승인 성공 시뮬레이션
                processPaymentSuccess();
            } else {
                alert('결제 비밀번호 6자리를 정확히 입력해주세요.');
            }
        });
    }

    const dpManageBtn = document.getElementById('dpManageBtn');
    const dpManageModal = document.getElementById('dpManageModal');
    const dpManageCancelBtn = document.getElementById('dpManageCancelBtn');
    const dpManageDeleteBtn = document.getElementById('dpManageDeleteBtn');

    if (dpManageBtn) {
        dpManageBtn.addEventListener('click', () => {
            if (dpManageModal) dpManageModal.style.display = 'flex';
        });
    }

    if (dpManageCancelBtn) {
        dpManageCancelBtn.addEventListener('click', () => {
            if (dpManageModal) dpManageModal.style.display = 'none';
        });
    }

    if (dpManageDeleteBtn) {
        dpManageDeleteBtn.addEventListener('click', () => {
            if (dpManageModal) dpManageModal.style.display = 'none';
            isDpRegistered = false;
            if (dpRegistered) dpRegistered.style.display = 'none';
            if (dpUnregistered) dpUnregistered.style.display = 'flex';
            alert('등록된 카드가 삭제되었습니다.');
        });
    }

    const successNextBtn = document.getElementById('successNextBtn');
    if (successNextBtn) successNextBtn.addEventListener('click', () => openCartFlowStep('stepOrderDetails', '주문 상세', '80%'));

    const orderDetailsNextBtn = document.getElementById('orderDetailsNextBtn');
    if (orderDetailsNextBtn) orderDetailsNextBtn.addEventListener('click', openDeliveryTracking);

    const closeCartFlowBtn = document.getElementById('closeCartFlowBtn');
    const cartBackBtn = document.getElementById('cartBackBtn');
    const cartDimOverlay = document.getElementById('cartDimOverlay');
    const deliveryCloseBtn = document.getElementById('deliveryCloseBtn');

    if (closeCartFlowBtn) closeCartFlowBtn.addEventListener('click', closeCartFlowModal);
    if (cartDimOverlay) cartDimOverlay.addEventListener('click', closeCartFlowModal);
    if (deliveryCloseBtn) deliveryCloseBtn.addEventListener('click', closeCartFlowModal);

    if (cartBackBtn) {
        cartBackBtn.addEventListener('click', () => {
            const currentStep = document.querySelector('.flow-step.page-active');
            if (!currentStep) return;
            const stepId = currentStep.id;

            if (stepId === 'stepCheckout') {
                openCartFlowStep('stepCart', '장바구니', '20%');
            } else if (stepId === 'stepSuccess') {
                openCartFlowStep('stepCheckout', '주문/결제', '40%');
            } else if (stepId === 'stepOrderDetails') {
                openCartFlowStep('stepSuccess', '결제 완료', '60%');
            } else if (stepId === 'stepDelivery') {
                openCartFlowStep('stepOrderDetails', '주문 상세', '80%');
            } else if (stepId === 'stepCart') {
                closeCartFlowModal(); // 첫 단계면 닫기
            }
        });
    }
    if (deliveryCloseBtn) deliveryCloseBtn.addEventListener('click', closeCartFlowModal);

    const cartCloseBtn = document.getElementById('cartCloseBtn');
    if (cartCloseBtn) {
        cartCloseBtn.addEventListener('click', () => {
            const stepCheckout = document.getElementById('stepCheckout');
            if (stepCheckout && stepCheckout.classList.contains('page-active')) {
                openCartFlowStep('stepCart', '장바구니', '20%');
            } else {
                closeCartFlowModal();
            }
        });
    }

    const cartRealCloseBtn = document.getElementById('cartRealCloseBtn');
    if (cartRealCloseBtn) cartRealCloseBtn.addEventListener('click', closeCartFlowModal);
    
    // 장바구니 추천 상품 렌더링 함수
    function renderCartRecommend() {
        const cartRecommendCarousel = document.getElementById('cartRecommendCarousel');
        if (!cartRecommendCarousel) return;

        const allProducts = [];
        Object.entries(MOCK_PRODUCTS).forEach(([categoryName, productsList]) => {
            productsList.forEach(productObj => {
                allProducts.push({ ...productObj, category: categoryName });
            });
        });
        
        const renderCards = () => {
            // 3개 랜덤 추출
            const recommends = allProducts.sort(() => 0.5 - Math.random()).slice(0, 3);
            cartRecommendCarousel.innerHTML = '';
            recommends.forEach(item => {
                const card = document.createElement('div');
                card.className = 'recommend-card';
                card.innerHTML = `
                    <img src="${item.img}" style="width:100%; aspect-ratio:1; object-fit:cover; border-radius:6px; margin-bottom:8px;">
                    <div style="font-size:11px; color:#c97b2e; margin-bottom:2px;">${item.category}</div>
                    <div style="font-size:12px; font-weight:600; color:#3d2c1e; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; text-overflow:ellipsis; margin-bottom:4px; line-height:1.3;">${item.name}</div>
                    <div style="font-size:13px; font-weight:700; color:#3d2c1e; margin-top:auto; padding-right:24px;">${item.price}</div>
                    <button class="add-recommend-btn" style="position:absolute; right:8px; bottom:8px; width:24px; height:24px; border-radius:50%; background:#f11b66; color:#fff; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                `;
                const btn = card.querySelector('.add-recommend-btn');
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    cartItems.push({ ...item, qty: 1, checked: true });
                    cartCount = cartItems.length;
                    const cartBadge = document.getElementById('cartBadge');
                    if (cartBadge) cartBadge.textContent = cartCount;
                    renderCartItems();
                    alert('장바구니에 추가되었습니다.');
                });
                cartRecommendCarousel.appendChild(card);
            });
        };

        renderCards();
        if (window.recommendInterval) clearInterval(window.recommendInterval);
        window.recommendInterval = setInterval(renderCards, 5000);
    }

    // 장바구니 렌더링 함수
    function renderCartItems() {
        const cartItemsList = document.getElementById('cartItemsList');
        const cartGroupCount = document.getElementById('cartGroupCount');
        const cartSubtotal = document.getElementById('cartSubtotal');
        const cartTotal = document.getElementById('cartTotal');
        const cartCtaPrice = document.getElementById('cartCtaPrice');
        const cartCtaCount = document.getElementById('cartCtaCount');
        
        if (!cartItemsList) return;
        
        if (cartItems.length === 0) {
            cartItemsList.innerHTML = `<div style="text-align:center; padding:40px 0; color:#a89a8c; font-size:14px;">장바구니가 비어있습니다. 🐾</div>`;
            if (cartGroupCount) cartGroupCount.textContent = '0';
            if (cartSubtotal) cartSubtotal.textContent = '0원';
            if (cartTotal) cartTotal.textContent = '0원';
            if (cartCtaPrice) cartCtaPrice.textContent = '0원';
            if (cartCtaCount) cartCtaCount.textContent = '0';
            const selectAllCb = document.getElementById('selectAllCheckbox');
            if (selectAllCb) selectAllCb.checked = false;
            return;
        }

        let totalAmount = 0;
        let totalItemsCount = 0;
        let checkedCount = 0;

        cartItemsList.innerHTML = cartItems.map((item, index) => {
            const priceNum = parseInt(item.price.replace(/[^0-9]/g, ''));
            const qty = item.qty || 1;
            const isChecked = item.checked !== false; // 기본값 true
            const itemTotal = priceNum * qty;
            
            if (isChecked) {
                totalAmount += itemTotal;
                totalItemsCount += qty;
                checkedCount++;
            }
            
            return `
                <div class="cart-item-card" style="display:flex; position:relative; padding:16px; background:#fff; border-radius:12px; margin-bottom:12px; border:1px solid #ede5da;">
                    <label class="cart-item-check-wrap" style="margin-right:12px; margin-top:2px;">
                        <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleCartItem(${index})">
                        <span class="custom-checkbox"></span>
                    </label>
                    <div style="display:flex; flex-direction:column; gap:8px; margin-right:16px;">
                        <img src="${item.img}" class="cart-item-thumb" alt="상품 이미지" style="width:72px; height:72px; object-fit:cover; border-radius:8px; border:1px solid #f5efeb;">
                        <div class="qty-select" style="background:#fff; border: 1px solid #ede5da; display:flex; align-items:center; border-radius:4px; overflow:hidden; width:72px; height:24px;">
                            <button onclick="updateCartQty(${index}, -1)" style="width:24px; height:24px; background:none; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#8c7664;">−</button>
                            <span style="flex:1; text-align:center; font-size:12px; color:#3d2c1e;">${qty}</span>
                            <button onclick="updateCartQty(${index}, 1)" style="width:24px; height:24px; background:none; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#8c7664;">+</button>
                        </div>
                    </div>
                    <div class="cart-item-info" style="flex:1;">
                        <div class="item-title" style="font-size:14px; font-weight:600; color:#3d2c1e; margin-bottom:8px; padding-right:20px;">${item.name}</div>
                        <div class="item-price-row" style="display:flex; align-items:center; gap:6px;">
                            ${item.discount ? `<span class="discount-rate" style="color:#f11b66; font-size:14px; font-weight:700;">${item.discount}</span>` : ''}
                            <span class="selling-price" style="font-size:15px; font-weight:700; color:#3d2c1e;">${itemTotal.toLocaleString()}원</span>
                        </div>
                    </div>
                    <button class="item-delete-btn" onclick="removeFromCart(${index})" style="position:absolute; right:16px; top:16px; background:none; border:none; font-size:18px; color:#c7bbb1; cursor:pointer;">✕</button>
                </div>
            `;
        }).join('');

        const selectAllCb = document.getElementById('selectAllCheckbox');
        if (selectAllCb) {
            selectAllCb.checked = (checkedCount === cartItems.length);
        }

        if (cartGroupCount) cartGroupCount.textContent = cartItems.length; // 전체 종류 수
        if (cartCtaCount) cartCtaCount.textContent = totalItemsCount; // 선택된 총 수량
        
        let finalAmount = totalAmount;
        let discountApplied = false;
        let totalDiscountAmount = 0;

        // 상세페이지 발급 5,000원 쿠폰
        if (isFirstPurchaseCouponApplied && totalAmount >= 5000 && checkedCount > 0) {
            totalDiscountAmount += 5000;
        }
        
        // 댕냥메디페이 결제 리워드 쿠폰 5,000원 할인 (체크박스)
        const useDpCouponCheckbox = document.getElementById('useDpCouponCheckbox');
        if (useDpCouponCheckbox && useDpCouponCheckbox.checked && checkedCount > 0 && hasEarnedDpCoupon) {
            totalDiscountAmount += 5000;
        }

        // 결제창 웰컴 쿠폰팩 10,000원 할인 (체크박스)
        const useCouponCheckbox = document.getElementById('useCouponCheckbox');
        if (useCouponCheckbox && useCouponCheckbox.checked && checkedCount > 0) {
            totalDiscountAmount += 10000;
        }

        // 총 할인액이 상품 금액을 초과하지 않도록 보정
        if (totalDiscountAmount > totalAmount) {
            totalDiscountAmount = totalAmount;
        }

        if (totalDiscountAmount > 0) {
            finalAmount = totalAmount - totalDiscountAmount;
            discountApplied = true;
        }

        const formattedSubTotal = totalAmount.toLocaleString() + '원';
        const formattedTotal = finalAmount.toLocaleString() + '원';
        
        if (cartSubtotal) cartSubtotal.textContent = formattedSubTotal;
        
        const cartDiscountRow = document.getElementById('cartDiscountRow');
        const checkoutDiscountRow = document.getElementById('checkoutDiscountRow');
        const checkoutTotalPrice = document.getElementById('checkoutTotalPrice');
        
        if (discountApplied) {
            if (cartDiscountRow) {
                cartDiscountRow.style.display = 'flex';
                const cartDiscountEl = document.getElementById('cartDiscount');
                if (cartDiscountEl) cartDiscountEl.textContent = `-${totalDiscountAmount.toLocaleString()}원`;
            }
            if (checkoutDiscountRow) {
                checkoutDiscountRow.style.display = 'flex';
                checkoutDiscountRow.innerHTML = `쿠폰 할인: <span style="font-weight: 700;">-${totalDiscountAmount.toLocaleString()}원</span>`;
            }
        } else {
            if (cartDiscountRow) cartDiscountRow.style.display = 'none';
            if (checkoutDiscountRow) checkoutDiscountRow.style.display = 'none';
        }

        if (cartTotal) cartTotal.textContent = formattedTotal;
        if (checkoutTotalPrice) checkoutTotalPrice.textContent = formattedTotal;
        if (cartCtaPrice) cartCtaPrice.textContent = formattedTotal;
    }

    // 전역 장바구니 조작 함수
    window.removeFromCart = function(index) {
        cartItems.splice(index, 1);
        cartCount = cartItems.length;
        const cartBadge = document.getElementById('cartBadge');
        if (cartBadge) cartBadge.textContent = cartCount;
        renderCartItems();
    };
    
    window.toggleCartItem = function(index) {
        if(cartItems[index].checked === undefined) cartItems[index].checked = true;
        cartItems[index].checked = !cartItems[index].checked;
        renderCartItems();
    };

    window.updateCartQty = function(index, delta) {
        let newQty = (cartItems[index].qty || 1) + delta;
        if (newQty < 1) newQty = 1;
        if (newQty > 99) newQty = 99;
        cartItems[index].qty = newQty;
        renderCartItems();
    };

    // 바텀시트 전역 변수
    const purchaseBottomSheet = document.getElementById('purchaseBottomSheet');
    const purchaseDimOverlay = document.getElementById('purchaseDimOverlay');
    let sheetQty = 1;
    let sheetTargetAction = 'cart'; // 'cart' or 'buy'

    function updateSheetUI() {
        if (!currentDetailProduct) return;
        const priceNum = parseInt(currentDetailProduct.price.replace(/[^0-9]/g, ''));
        const totalNum = priceNum * sheetQty;
        const formattedBasePrice = priceNum.toLocaleString() + '원';
        const formattedTotal = totalNum.toLocaleString() + '원';
        const reward = Math.floor(totalNum * 0.005).toLocaleString() + '원'; // 0.5% 적립 예시

        document.getElementById('sheetItemTitle').textContent = `1개 (${formattedBasePrice})`;
        document.getElementById('sheetQtyVal').textContent = sheetQty;
        document.getElementById('sheetItemPrice').textContent = formattedTotal;
        document.getElementById('sheetTotalQty').textContent = sheetQty;
        document.getElementById('sheetTotalPrice').textContent = formattedTotal;
        document.getElementById('sheetRewardPoints').textContent = reward;
    }

    // 검색 모의 로직 (우편번호 포함)
    function performAddressSearch() {
        const keyword = document.getElementById('addressSearchInput')?.value.trim();
        if (!keyword) {
            alert('검색어를 입력해주세요.');
            return;
        }

        const recentAddrArea = document.getElementById('recentAddrArea');
        const searchResultsArea = document.getElementById('searchResultsArea');
        const searchResultsList = document.getElementById('searchResultsList');

        if (recentAddrArea) recentAddrArea.style.display = 'none';
        if (searchResultsArea) searchResultsArea.style.display = 'block';

        // 검색 결과 Mock 데이터
        if (searchResultsList) {
            // 키워드가 '아파트'나 '빌라'로 끝나지 않으면 뒤에 붙여주기
            let suffix1 = '';
            let suffix2 = ' 2단지';
            if (!keyword.includes('아파트') && !keyword.includes('빌라') && !keyword.includes('오피스텔')) {
                suffix1 = '아파트';
            }

            searchResultsList.innerHTML = `
                <div class="search-result-item" style="padding:12px 0; border-bottom:1px solid #f5efeb; cursor:pointer;" onclick="selectAddress('대전광역시 서구 둔산로 123 (${keyword}${suffix1})')">
                    <div style="font-size:12px; color:#c97b2e; font-weight:600; margin-bottom:4px;">[우편번호 35234]</div>
                    <div style="font-size:15px; font-weight:700; color:#111;">대전광역시 서구 둔산로 123</div>
                    <div style="font-size:13px; color:#8c7664; margin-top:2px;">(둔산동, ${keyword}${suffix1})</div>
                </div>
                <div class="search-result-item" style="padding:12px 0; border-bottom:1px solid #f5efeb; cursor:pointer;" onclick="selectAddress('서울특별시 강남구 테헤란로 456 (${keyword}${suffix2})')">
                    <div style="font-size:12px; color:#c97b2e; font-weight:600; margin-bottom:4px;">[우편번호 06123]</div>
                    <div style="font-size:15px; font-weight:700; color:#111;">서울특별시 강남구 테헤란로 456</div>
                    <div style="font-size:13px; color:#8c7664; margin-top:2px;">(역삼동, ${keyword}${suffix2})</div>
                </div>
                <div class="search-result-item" style="padding:12px 0; border-bottom:1px solid #f5efeb; cursor:pointer;" onclick="selectAddress('부산광역시 해운대구 마린시티로 789 (${keyword})')">
                    <div style="font-size:12px; color:#c97b2e; font-weight:600; margin-bottom:4px;">[우편번호 48000]</div>
                    <div style="font-size:15px; font-weight:700; color:#111;">부산광역시 해운대구 마린시티로 789</div>
                    <div style="font-size:13px; color:#8c7664; margin-top:2px;">(우동, ${keyword})</div>
                </div>
            `;
        }
    }

    document.getElementById('addressSearchIconBtn')?.addEventListener('click', performAddressSearch);
    document.getElementById('addressSearchInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performAddressSearch();
    });

    // 하단 핑크색 '검색' 버튼 클릭 시 즉시 첫 번째 결과로 자동 반영(선택)
    document.getElementById('doAddressSearchBtn')?.addEventListener('click', () => {
        const keyword = document.getElementById('addressSearchInput')?.value.trim();
        if (!keyword) {
            alert('검색어를 입력해주세요.');
            return;
        }
        let suffix1 = '';
        if (!keyword.includes('아파트') && !keyword.includes('빌라') && !keyword.includes('오피스텔')) {
            suffix1 = '아파트';
        }
        // 즉시 주소 반영
        selectAddress(`대전광역시 서구 둔산로 123 (${keyword}${suffix1})`);
    });

    // 이전에 window 객체에 추가해야 HTML onclick에서 작동합니다.
    window.selectAddress = selectAddress;

    const ADDRESS_DB = [
        // 서울/경기
        { zip:'18445', road:'경기도 화성시 동탄대로 537', building:'동탄메타폴리스', dong:'반송동' },
        { zip:'12256', road:'경기도 남양주시 다산중앙로 82번길 95', building:'다산푸르지오아파트', dong:'다산동' },
        { zip:'14563', road:'경기도 부천시 소향로 170', building:'현대백화점중동점', dong:'중동' },
        { zip:'21510', road:'경기도 광주시 행정타운로 50', building:'광주시청', dong:'쌍령동' },
        // 인천
        { zip:'22341', road:'인천광역시 중구 공항로 272', building:'인천국제공항', dong:'운서동' },
        { zip:'21989', road:'인천광역시 연수구 센트럴로 263', building:'송도 아이파크', dong:'송도동' },
        { zip:'22003', road:'인천광역시 연수구 갯벌로 12', building:'연수래미안아파트', dong:'동춘동' },
        { zip:'21565', road:'인천광역시 남동구 소래로 63', building:'논현푸르지오아파트', dong:'논현동' },
        { zip:'22156', road:'인천광역시 서구 에코로 181', building:'청라한양수자인아파트', dong:'청라동' },
        // 부산
        { zip:'48058', road:'부산광역시 해운대구 해운대해변로 264', building:'해운대엘시티', dong:'우동' },
        { zip:'48001', road:'부산광역시 해운대구 마린시티2로 33', building:'마린시티두산위브아파트', dong:'중동' },
        { zip:'47229', road:'부산광역시 부산진구 가야대로 772', building:'서면롯데백화점', dong:'부전동' },
        { zip:'47511', road:'부산광역시 사상구 새벽로 48', building:'모라래미안아파트', dong:'모라동' },
        { zip:'46726', road:'부산광역시 강서구 명지국제5로 118', building:'명지오션시티아파트', dong:'명지동' },
        { zip:'48942', road:'부산광역시 기장군 기장해안로 147', building:'기장해비치아파트', dong:'기장읍' },
        { zip:'49000', road:'부산광역시 동래구 안락로 66', building:'동래래미안아파트', dong:'안락동' },
        // 대전
        { zip:'35234', road:'대전광역시 서구 둔산로 100', building:'둔산힐스테이트아파트', dong:'둔산동' },
        { zip:'35239', road:'대전광역시 서구 계룡로 553', building:'갤러리아타임월드', dong:'탄방동' },
        { zip:'34134', road:'대전광역시 유성구 엑스포로 107', building:'대전엑스포과학공원', dong:'도룡동' },
        { zip:'34121', road:'대전광역시 유성구 대학로 99', building:'충남대학교', dong:'궁동' },
        { zip:'34929', road:'대전광역시 동구 홍도로 60', building:'홍도동새벽시장', dong:'홍도동' },
        { zip:'35000', road:'대전광역시 중구 중앙로 100', building:'대전역', dong:'정동' },
        { zip:'35208', road:'대전광역시 서구 도솔로 27', building:'도솔마을래미안아파트', dong:'도마동' },
        // 광주
        { zip:'61452', road:'광주광역시 동구 금남로 245', building:'전일빌딩245', dong:'금남로1가' },
        { zip:'62223', road:'광주광역시 광산구 임방울대로 351', building:'수완지구아이파크아파트', dong:'수완동' },
        { zip:'61963', road:'광주광역시 남구 봉선로 2', building:'봉선동래미안아파트', dong:'봉선동' },
        { zip:'62021', road:'광주광역시 광산구 첨단과기로 333', building:'광주과학기술원', dong:'월계동' },
        // 대구
        { zip:'42026', road:'대구광역시 수성구 알파시티1로 215', building:'대구알파시티SK뷰아파트', dong:'대흥동' },
        { zip:'41902', road:'대구광역시 북구 경대로 80', building:'경북대학교', dong:'산격동' },
        { zip:'42019', road:'대구광역시 수성구 동대구로 390', building:'두산위브더제니스아파트', dong:'범어동' },
        { zip:'41061', road:'대구광역시 달서구 구마로 254', building:'죽전래미안아파트', dong:'죽전동' },
        // 울산
        { zip:'44702', road:'울산광역시 남구 삼산로 288', building:'롯데백화점울산점', dong:'삼산동' },
        { zip:'44001', road:'울산광역시 중구 종가로 345', building:'울산시청', dong:'성안동' },
        { zip:'44903', road:'울산광역시 울주군 언양읍 언양로 165', building:'언양읍사무소', dong:'서부리' },
        // 세종
        { zip:'30151', road:'세종특별자치시 한누리대로 2130', building:'정부세종청사', dong:'어진동' },
        { zip:'30084', road:'세종특별자치시 보람동 세종로 2639', building:'세종푸르지오아파트', dong:'보람동' },
        // 충청
        { zip:'31065', road:'충청남도 천안시 서북구 불당26로 46', building:'천안불당아이파크아파트', dong:'불당동' },
        { zip:'28431', road:'충청북도 청주시 상당구 상당로 100', building:'청주시청', dong:'북문로1가' },
        // 전라
        { zip:'54994', road:'전라북도 전주시 완산구 효자로 225', building:'전주시청', dong:'효자동2가' },
        { zip:'58801', road:'전라남도 목포시 평화로 171', building:'목포시청', dong:'평화동1가' },
        // 경상
        { zip:'36000', road:'경상북도 경주시 알천북로 1', building:'경주역', dong:'황성동' },
        { zip:'52000', road:'경상남도 창원시 성산구 중앙대로 151', building:'창원시청', dong:'상남동' },
        { zip:'50131', road:'경상남도 양산시 물금읍 가촌로 50', building:'양산물금아이파크아파트', dong:'물금읍' },
        // 강원
        { zip:'24232', road:'강원도 춘천시 공지로 284', building:'춘천시청', dong:'옥천동' },
        { zip:'25440', road:'강원도 강릉시 강릉대로 33', building:'강릉시청', dong:'홍제동' },
        // 제주
        { zip:'63122', road:'제주특별자치도 제주시 문연로 6', building:'제주도청', dong:'이도2동' },
        { zip:'63572', road:'제주특별자치도 서귀포시 중정로 22', building:'서귀포시청', dong:'서귀동' },
    ];

    // 검색 모의 로직 (키워드 매칭)
    function performAddressSearch() {
        const keyword = document.getElementById('addressSearchInput')?.value.trim();
        if (!keyword) {
            alert('검색어를 입력해주세요.');
            return;
        }

        const recentAddrArea = document.getElementById('recentAddrArea');
        const searchResultsArea = document.getElementById('searchResultsArea');
        const searchResultsList = document.getElementById('searchResultsList');

        if (recentAddrArea) recentAddrArea.style.display = 'none';
        if (searchResultsArea) searchResultsArea.style.display = 'block';

        if (searchResultsList) {
            // 키워드로 주소 데이터 필터링 (도로명, 건물명, 동명, 우편번호 모두 검색)
            const kw = keyword.toLowerCase();
            const matched = ADDRESS_DB.filter(a =>
                a.road.toLowerCase().includes(kw) ||
                a.building.toLowerCase().includes(kw) ||
                a.dong.toLowerCase().includes(kw) ||
                a.zip.includes(kw)
            ).slice(0, 8); // 최대 8개

            if (matched.length === 0) {
                // 결과 없을 때: 키워드를 첫 번째 DB 주소에 건물명으로 붙여 표시
                const fallback = ADDRESS_DB[Math.floor(Math.random() * 10)];
                searchResultsList.innerHTML = `
                    <div style="padding:24px 0; text-align:center;">
                        <div style="font-size:36px; margin-bottom:12px;">🔍</div>
                        <div style="font-size:14px; font-weight:700; color:#3d2c1e; margin-bottom:6px;">'${keyword}'에 대한 검색 결과가 없습니다</div>
                        <div style="font-size:12px; color:#8c7664;">도로명, 건물명, 동·읍·면으로 검색해 보세요</div>
                        <div style="font-size:11px; color:#b0a090; margin-top:8px;">예) 둔산로, 테헤란로, 롯데, 삼성동, 역삼동</div>
                    </div>
                `;
            } else {
                searchResultsList.innerHTML = matched.map(a => `
                    <div class="search-result-item"
                        style="padding:14px 0; border-bottom:1px solid #f5efeb; cursor:pointer;"
                        onclick="selectAddress('${a.road}')">
                        <div style="font-size:11px; color:#c97b2e; font-weight:700; margin-bottom:4px;">[${a.zip}]</div>
                        <div style="font-size:15px; font-weight:700; color:#111; margin-bottom:2px;">${a.road}</div>
                        <div style="font-size:12px; color:#8c7664;">(${a.dong}, ${a.building})</div>
                    </div>
                `).join('');
            }
        }
    }

    document.getElementById('addressSearchIconBtn')?.addEventListener('click', performAddressSearch);
    document.getElementById('addressSearchInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performAddressSearch();
    });

    // 하단 '검색' 버튼도 동일하게 performAddressSearch 실행
    document.getElementById('doAddressSearchBtn')?.addEventListener('click', performAddressSearch);

    // 이전에 window 객체에 추가해야 HTML onclick에서 작동합니다.
    window.selectAddress = selectAddress;

    document.getElementById('addressSaveBtn')?.addEventListener('click', () => {
        const newName = document.getElementById('addressInputName').value;
        const newPhone = document.getElementById('addressInputPhone').value;
        const mainAddr = document.getElementById('addressInputAddr').value;
        const detailAddr = document.getElementById('addressInputDetail')?.value || '';
        const newAddr = mainAddr + (detailAddr ? ' ' + detailAddr : '');

        if (!newName || !newPhone || !mainAddr) {
            alert('모든 기본 배송지 정보를 입력해주세요.');
            return;
        }

        // 주소에서 처음 두 단어 추출하여 지역명 설정 (예: 대전광역시 동구 -> 대전시 동구)
        const addrParts = newAddr.split(' ');
        let shortCity = addrParts[0] || '';
        shortCity = shortCity.replace('광역시', '시').replace('특별시', '시').replace('특별자치시', '시').replace('특별자치도', '도');
        const regionName = addrParts.length >= 2 ? `${shortCity} ${addrParts[1]}` : newAddr;
        
        const sheetDeliveryRegion = document.getElementById('sheetDeliveryRegion');
        if (sheetDeliveryRegion) sheetDeliveryRegion.textContent = regionName;

        // 장바구니 페이지 내 텍스트 업데이트
        const cartDeliveryName = document.getElementById('cartDeliveryName');
        const cartDeliveryPhone = document.getElementById('cartDeliveryPhone');
        const cartDeliveryAddress = document.getElementById('cartDeliveryAddress');

        if (cartDeliveryName) cartDeliveryName.textContent = newName;
        if (cartDeliveryPhone) cartDeliveryPhone.textContent = newPhone;
        if (cartDeliveryAddress) cartDeliveryAddress.textContent = newAddr;

        // 결제 페이지(stepCheckout)의 input 필드도 동기화
        const chkName = document.getElementById('chkName');
        const chkPhone = document.getElementById('chkPhone');
        const chkAddress = document.getElementById('chkAddress');

        if (chkName) chkName.value = newName;
        if (chkPhone) chkPhone.value = newPhone;
        if (chkAddress) chkAddress.value = newAddr;

        alert('배송지가 변경되었습니다.');
        closeAddressSheet();
    });

    const addCartBtn = document.getElementById('addCartBtn');
    if (addCartBtn) {
        addCartBtn.addEventListener('click', () => {
            openPurchaseSheet('cart');
        });
    }

    const wishBtn = document.getElementById('wishBtn');
    if (wishBtn) {
        wishBtn.addEventListener('click', () => {
            wishBtn.classList.toggle('active');
            if (wishBtn.classList.contains('active')) {
                if (currentDetailProduct) {
                    cartItems.push(currentDetailProduct);
                    cartCount = cartItems.length;
                    const cartBadge = document.getElementById('cartBadge');
                    if (cartBadge) cartBadge.textContent = cartCount;
                    renderCartItems();
                }
                alert('❤️ 찜 목록에 추가되었으며, 장바구니에도 함께 담겼습니다!');
            } else {
                alert('🤍 찜이 취소되었습니다.');
            }
        });
    }

    const buyNowBtn = document.getElementById('buyNowBtn');
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', () => {
            openPurchaseSheet('buy');
        });
    }

    function addChatMessage(text, sender, options = null) {
        if (!chatbotMessages) return;
        const row = document.createElement('div');
        row.className = `chat-row ${sender === 'user' ? 'user' : ''}`;
        
        if (sender === 'bot') {
            const avatar = document.createElement('div');
            avatar.className = 'chat-avatar-mini';
            avatar.innerHTML = `<svg viewBox="0 0 36 36" fill="none"><ellipse cx="18" cy="24" rx="9" ry="7" fill="#e87a7a" opacity="0.95"></ellipse><ellipse cx="8" cy="14" rx="4" ry="5" fill="#e87a7a" opacity="0.9" transform="rotate(-15 8 14)"></ellipse><ellipse cx="14" cy="10" rx="4" ry="5" fill="#e87a7a" opacity="0.9" transform="rotate(-5 14 10)"></ellipse><ellipse cx="22" cy="10" rx="4" ry="5" fill="#e87a7a" opacity="0.9" transform="rotate(5 22 10)"></ellipse><ellipse cx="28" cy="14" rx="4" ry="5" fill="#e87a7a" opacity="0.9" transform="rotate(15 28 14)"></ellipse></svg>`;
            row.appendChild(avatar);
            
            const bubble = document.createElement('div');
            bubble.className = 'chat-bubble bot-bubble';
            // 줄바꿈 처리
            bubble.innerHTML = text.replace(/\n/g, '<br>');
            row.appendChild(bubble);
        } else {
            const bubble = document.createElement('div');
            bubble.className = 'chat-bubble user-bubble';
            bubble.innerHTML = text.replace(/\n/g, '<br>');
            row.appendChild(bubble);
        }
        
        chatbotMessages.appendChild(row);

        // 옵션 버튼이 있다면 추가
        if (options && options.length > 0) {
            const choicesWrap = document.createElement('div');
            choicesWrap.className = 'chat-choice-wrap';
            options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'chat-choice-btn';
                btn.textContent = opt.label;
                btn.addEventListener('click', () => {
                    if (opt.action === 'goProduct') {
                        closeChatbot();
                        openProductDetail(opt.category);
                    } else if (opt.action === 'goClinic') {
                        closeChatbot();
                        goToClinicTab();
                    } else if (opt.action === 'goDelivery') {
                        closeChatbot();
                        openDeliveryTracking();
                    }
                });
                choicesWrap.appendChild(btn);
            });
            chatbotMessages.appendChild(choicesWrap);
        }

        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function handleChatbotSubmit() {
        if (!chatbotInput || !chatbotInput.value.trim()) return;
        const userText = chatbotInput.value.trim();
        addChatMessage(userText, 'user');
        chatbotInput.value = '';
        
        setTimeout(() => {
            let reply = '말씀하신 증상을 분석 중입니다... 더 정밀한 분석을 위해 클리닉을 받아보시겠어요?';
            let category = '면역력 UP';
            let options = null;

            if (userText.includes('배송') || userText.includes('언제') || userText.includes('조회') || userText.includes('택배')) {
                reply = '주문하신 상품의 배송 상태를 확인해 드릴게요! 아래 버튼을 눌러 배송 조회를 진행해주세요. 🚚';
                options = [
                    { label: '배송 조회하기 📦', action: 'goDelivery' }
                ];
            } else if (userText.includes('발') || userText.includes('핥') || userText.includes('긁어') || userText.includes('피부') || userText.includes('각질')) {
                reply = '피부염이나 알러지가 의심되네요. 우리 아이를 위한 피부 진정 및 보습 상품을 확인해 보시거나, AI 맞춤 클리닉에서 원인을 더 자세히 분석해 볼까요?';
                category = '피부/보송';
            } else if (userText.includes('토') || userText.includes('헤어볼') || userText.includes('소화')) {
                reply = '소화 불량이나 헤어볼 문제일 수 있습니다. 편안한 속을 위한 전용 영양제를 추천해 드립니다. 또는 클리닉을 통해 정밀 진단을 받아보세요.';
                category = '헤어볼/소화';
            } else if (userText.includes('눈') || userText.includes('눈물')) {
                reply = '눈물 자국은 눈 건강 영양제나 세정제로 꾸준한 관리가 필요합니다. 맞춤 상품을 추천해 드릴까요?';
                category = '눈물/눈병';
            } else if (userText.includes('관절') || userText.includes('다리') || userText.includes('절뚝')) {
                reply = '관절이 안 좋거나 슬개골 탈구가 의심될 수 있습니다. 슬개골 예방 영양제를 추천해 드립니다. 더 자세한 분석을 원하시면 클리닉을 진행해 보세요.';
                category = '관절 케어';
            } else if (userText.includes('안녕') || userText.includes('반갑') || userText.includes('하이')) {
                reply = '안녕하세요! 댕냥메디 챗봇입니다. 우리 아이의 어떤 증상이 걱정되시나요? (예: "자꾸 피부를 긁어요")';
                options = [];
            }

            if (options === null) {
                options = [
                    { label: '추천 상품 보기 🎁', action: 'goProduct', category: category },
                    { label: 'AI 맞춤 클리닉 이동 🩺', action: 'goClinic' }
                ];
            }
            
            addChatMessage(reply, 'bot', options);
        }, 800);
    }

    if (chatbotSendBtn) chatbotSendBtn.addEventListener('click', handleChatbotSubmit);
    if (chatbotInput) {
        chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleChatbotSubmit();
        });
    }

    const startConsultBtn = document.querySelector('.consult-start-btn') || document.querySelector('#optSubmitBtn'); 
    if (startConsultBtn) {
        startConsultBtn.addEventListener('click', openChatbot);
    }

    // ===== 로그인 모달 열기 로직 =====
    const authOverlay = document.getElementById('authOverlay');
    const authModal = document.getElementById('authModal');
    const authCloseBtn = document.getElementById('authCloseBtn');
    
    function openLoginModal() {
        if (authOverlay && authModal) {
            authOverlay.classList.add('show');
            authModal.classList.add('show');
        }
    }
    
    function closeLoginModal() {
        if (authOverlay && authModal) {
            authOverlay.classList.remove('show');
            authModal.classList.remove('show');
        }
    }
    
    if (authCloseBtn) authCloseBtn.addEventListener('click', closeLoginModal);
    if (authOverlay) authOverlay.addEventListener('click', closeLoginModal);

    // 장바구니 및 프로필 클릭 이벤트 리스너 제거됨 (index.html에서 직접 <a> 태그로 이동)

    // 로그인/회원가입 탭 전환 로직
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const goRegisterBtn = document.getElementById('goRegisterBtn');
    const goLoginBtn = document.getElementById('goLoginBtn');

    function switchAuthTab(tab) {
        if (tab === 'login') {
            if (loginTab) loginTab.classList.add('active');
            if (registerTab) registerTab.classList.remove('active');
            if (loginForm) loginForm.classList.remove('hidden');
            if (registerForm) registerForm.classList.add('hidden');
        } else {
            if (registerTab) registerTab.classList.add('active');
            if (loginTab) loginTab.classList.remove('active');
            if (registerForm) registerForm.classList.remove('hidden');
            if (loginForm) loginForm.classList.add('hidden');
        }
    }

    if (loginTab) loginTab.addEventListener('click', () => switchAuthTab('login'));
    if (registerTab) registerTab.addEventListener('click', () => switchAuthTab('register'));
    if (goRegisterBtn) goRegisterBtn.addEventListener('click', () => switchAuthTab('register'));
    if (goLoginBtn) goLoginBtn.addEventListener('click', () => switchAuthTab('login'));

    // 상품 상세 오버레이 닫기 로직 (홈 뷰 복구)
    const detailCloseBtn = document.getElementById('detailCloseBtn');
    const appContainer = document.querySelector('.app');
    if (detailCloseBtn && appContainer) {
        detailCloseBtn.addEventListener('click', () => {
            appContainer.classList.remove('hide-home');
            appContainer.style.overflowY = ''; // 스크롤 복원
        });
    }

    // ===== 하단 네비게이션 탭 전환 (홈 vs 클리닉) =====
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    const homeArea = document.getElementById('homeArea');
    const clinicArea = document.getElementById('clinicArea');
    const eventBanner = document.querySelector('.event-banner-section'); // 이벤트 배너도 홈에 종속
    const bannerSlider = document.querySelector('.banner-slider-section'); // 메인 배너

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // "프로필", "장바구니" 등 링크가 있는 요소는 자체 작동 (e.preventDefault 하지 않음)
            if (item.tagName.toLowerCase() === 'a') return;
            
            const page = item.dataset.page;
            
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            
            if (page === '홈') {
                if (homeArea) homeArea.style.display = '';
                if (eventBanner) eventBanner.style.display = '';
                if (bannerSlider) bannerSlider.style.display = '';
                if (clinicArea) clinicArea.style.display = 'none';
            } else if (page === '클리닉') {
                if (homeArea) homeArea.style.display = 'none';
                if (eventBanner) eventBanner.style.display = 'none';
                if (bannerSlider) bannerSlider.style.display = 'none';
                if (clinicArea) clinicArea.style.display = 'block';
            } else {
                alert(page + ' 페이지는 준비 중입니다!');
            }
        });
    });

    // ===== AI 정밀 분석 마법사 로직 =====
    const startAiBtn = document.getElementById('startAiBtn');
    const aiLoadingBox = document.getElementById('aiLoadingBox');
    const clinicWizard = document.querySelector('.clinic-wizard');
    const clinicReviews = document.getElementById('clinicReviews');

    if (startAiBtn) {
        startAiBtn.addEventListener('click', () => {
            const selectedSymp = document.querySelector('input[name="clinicSymp"]:checked');
            if (!selectedSymp) {
                alert('어디가 불편한지 먼저 선택해주세요! 🐾');
                return;
            }
            
            const label = selectedSymp.value;
            
            // UI 트랜지션: 스텝 숨기고 로딩 표시
            clinicWizard.style.display = 'none';
            if (clinicReviews) clinicReviews.style.display = 'none';
            aiLoadingBox.style.display = 'block';
            
            // 1.5초 후 분석 결과(상품 상세)로 이동
            setTimeout(() => {
                // 상세 오버레이 열기 (기존에 작성된 오픈 로직 재활용)
                openProductDetail(label);
                
                // AI 분석 완료 시 글로벌 건강 상담 횟수 1 증가 (전역 변수 업데이트)
                globalConsultCount++;
                const statConsultTarget = document.getElementById('statConsultTarget');
                if (statConsultTarget) {
                    statConsultTarget.setAttribute('data-target', globalConsultCount);
                    // 이미 애니메이션이 한 번 실행된 후라면, UI 텍스트도 즉시 최신값으로 업데이트
                    if (statConsultTarget.classList.contains('counted')) {
                        statConsultTarget.textContent = globalConsultCount.toLocaleString();
                    }
                }
                
                // 클리닉 뷰 원래 상태로 리셋 (다음에 다시 들어올 때를 위해)
                clinicWizard.style.display = 'block';
                if (clinicReviews) clinicReviews.style.display = 'block';
                aiLoadingBox.style.display = 'none';
                
            }, 1500);
        });
    }

    // ===== 오늘의 건강 가이드: 무한 롤링 카루셀 복제 로직 =====
    const marqueeTrack = document.getElementById('guideMarqueeTrack');
    if (marqueeTrack) {
        // 기존 카드들을 가져옴
        const cards = Array.from(marqueeTrack.children);
        // 무한 스크롤을 위해 모든 카드를 1번씩 복제해서 뒤에 붙임
        // (CSS에서 애니메이션을 width의 50%만큼 이동시키도록 설정했음)
        cards.forEach(card => {
            const clone = card.cloneNode(true);
            // 복제된 카드에는 ID가 중복되지 않도록 제거
            clone.removeAttribute('id');
            marqueeTrack.appendChild(clone);
        });
    }

    // ===== 실시간 베스트 랭킹: Intersection Observer 순차 애니메이션 =====
    const rankCards = document.querySelectorAll('.rank-card');
    if (rankCards.length > 0) {
        const observerOptions = {
            root: document.getElementById('homeArea'),
            rootMargin: '0px 0px -50px 0px', // 화면에 살짝 더 들어왔을 때 실행되도록 하단 마진 음수값
            threshold: 0.1
        };

        const rankObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('pop-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        rankCards.forEach(card => rankObserver.observe(card));
    }

    // ===== 통계 숫자 스크롤 카운팅 애니메이션 =====
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statNums = entry.target.querySelectorAll('.stat-num[data-target]');
                    statNums.forEach(stat => {
                        if (stat.classList.contains('counted')) return; // 한 번만 실행
                        stat.classList.add('counted');
                        
                        const suffix = stat.getAttribute('data-suffix') || '';
                        const duration = 1200; // 1.2초
                        const startTime = performance.now();
                        
                        const animateNum = (currentTime) => {
                            // 애니메이션 도중에도 최신 타겟값을 읽어옴 (클리닉을 다녀와서 증가했을 수 있음)
                            const currentTarget = parseInt(stat.getAttribute('data-target'), 10);
                            
                            const elapsedTime = currentTime - startTime;
                            const progress = Math.min(elapsedTime / duration, 1);
                            
                            // ease-out 효과 (점점 느려지는 연출)
                            const easeProgress = 1 - Math.pow(1 - progress, 3);
                            const currentVal = Math.floor(easeProgress * currentTarget);
                            
                            stat.textContent = currentVal.toLocaleString() + suffix;
                            
                            if (progress < 1) {
                                requestAnimationFrame(animateNum);
                            } else {
                                stat.textContent = currentTarget.toLocaleString() + suffix;
                            }
                        };
                        requestAnimationFrame(animateNum);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { 
            root: document.getElementById('homeArea'), 
            rootMargin: '0px 0px -20px 0px',
            threshold: 0.1 
        });
        
        statsObserver.observe(statsSection);
    }

    // 상세페이지 더보기 버튼 제거됨 - 컨텐츠 항상 전체 표시

    // ===== 리뷰 기능 구현 =====
    let reviews = [
        {
            id: 1,
            author: "치치",
            petInfo: "코리아 숏헤어 · 21살 · 5kg",
            rating: 5,
            date: "2026-05-25",
            content: "우다다를 너무 심하게 해서 관절 걱정이 많았는데, 이거 먹이고 나서는 한결 부드러워진 느낌이에요! 기호성도 너무 좋아서 간식인 줄 알고 알아서 찾아 먹네요. 재구매 의사 200% 입니다 🐾💖",
            likes: 24,
            photos: ["cat_treats.png", "cat_hairball.png", "skin_care.png"],
            comments: []
        },
        {
            id: 2,
            author: "초코맘",
            petInfo: "푸들 · 5살 · 4.2kg",
            rating: 4,
            date: "2026-05-28",
            content: "냄새가 조금 강하긴 한데 아이가 너무 잘 먹어요. 1주일 정도 먹였는데 피부 각질이 눈에 띄게 줄어들었습니다. 다 먹이면 재구매 할게요!",
            likes: 12,
            photos: ["dog_shampoo.png"],
            comments: []
        },
        {
            id: 3,
            author: "우주비행사",
            petInfo: "비숑 프리제 · 2살 · 3.8kg",
            rating: 5,
            date: "2026-06-01",
            content: "눈물 자국 때문에 스트레스가 많았는데, 꾸준히 급여하니 눈가가 뽀송해졌어요. 알러지 반응도 없고 성분도 믿음직스러워 계속 정착할 예정입니다.",
            likes: 45,
            photos: [],
            comments: [{ author: "관리자", text: "우주비행사님! 눈물 자국이 개선되어 정말 다행이네요. 앞으로도 좋은 제품으로 보답하겠습니다! 🐶" }]
        },
        {
            id: 4,
            author: "냥냥펀치",
            petInfo: "먼치킨 · 3살 · 4kg",
            rating: 3,
            date: "2026-06-03",
            content: "효과는 좋은 것 같은데 저희 아이 입맛에는 안 맞는지 억지로 먹여야 하네요 ㅠㅠ 기호성 팁이 있을까요?",
            likes: 5,
            photos: [],
            comments: []
        }
    ];

    const reviewListContainer = document.getElementById('reviewListContainer');
    const reviewSortSelect = document.getElementById('reviewSortSelect');
    
    function getStarsHTML(rating) {
        let stars = '';
        for(let i=0; i<5; i++) {
            stars += (i < rating) ? '⭐' : '☆';
        }
        return stars;
    }

    function renderReviews() {
        if (!reviewListContainer) return;
        reviewListContainer.innerHTML = '';
        
        const sortType = reviewSortSelect ? reviewSortSelect.value : 'best';
        const myPetFilterCheck = document.getElementById('myPetFilterCheck');
        const isMyPetChecked = myPetFilterCheck ? myPetFilterCheck.checked : false;
        
        const selectCatBtn = document.getElementById('selectCat');
        const isCatMode = selectCatBtn && selectCatBtn.classList.contains('active');
        
        let sortedReviews = [...reviews];
        
        if (isMyPetChecked) {
            sortedReviews = sortedReviews.filter(r => {
                if (isCatMode) {
                    return r.petInfo.includes('고양이') || r.petInfo.includes('숏헤어') || r.petInfo.includes('먼치킨');
                } else {
                    return r.petInfo.includes('강아지') || r.petInfo.includes('푸들') || r.petInfo.includes('비숑');
                }
            });
        }

        if (sortType === 'best') {
            sortedReviews.sort((a, b) => b.likes - a.likes);
        } else if (sortType === 'newest') {
            sortedReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        sortedReviews.forEach((review) => {
            const card = document.createElement('div');
            card.className = 'review-card';
            
            let matchBadgeHtml = '';
            if (isMyPetChecked) {
                let badgeText = isCatMode ? '🐱 우리 아이와 묘종이 같아요!' : '🐶 우리 아이와 견종이 같아요!';
                if (review.petInfo.includes('5kg') && isCatMode) badgeText = '⚖️ 비슷한 체중(5kg)의 후기예요!';
                if ((review.petInfo.includes('4kg') || review.petInfo.includes('4.2kg')) && !isCatMode) badgeText = '⚖️ 비슷한 체중(4kg대)의 후기예요!';
                
                matchBadgeHtml = `<div style="display:inline-block; padding:4px 10px; background:#fff0e6; color:#c97b2e; border:1px solid #fbdcbe; border-radius:12px; font-size:11px; font-weight:bold; margin-bottom:12px; box-shadow:0 2px 4px rgba(201,123,46,0.1);">${badgeText}</div>`;
            }
            
            let photosHtml = '';
            if (review.photos && review.photos.length > 0) {
                photosHtml = `<div class="review-photos">
                    ${review.photos.map(p => `<img src="${p}" class="review-photo" alt="리뷰 사진">`).join('')}
                </div>`;
            }
            
            let commentsHtml = '';
            if (review.comments && review.comments.length > 0) {
                commentsHtml = `<div style="margin-top:12px; padding: 10px; background: #faf7f2; border-radius: 8px; font-size: 12px; color: #5a4b3c;">
                    ${review.comments.map(c => `<div style="margin-bottom:4px;"><strong>${c.author}:</strong> ${c.text}</div>`).join('')}
                </div>`;
            }

            card.innerHTML = `
              ${matchBadgeHtml}
              <div class="review-user">
                <div class="user-avatar">
                  <div style="width:100%; height:100%; background:#e87a7a; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; border-radius:50%; font-size:14px;">${review.author.substring(0,1)}</div>
                </div>
                <div class="user-info">
                  <div class="user-name">${review.author} <span class="score-stars-small">${getStarsHTML(review.rating)}</span></div>
                  <div class="pet-info">${review.petInfo} · ${review.date}</div>
                </div>
              </div>
              ${photosHtml}
              <p class="review-text">${review.content}</p>
              ${commentsHtml}
              <div class="review-actions">
                <button class="review-btn helpful-btn" data-id="${review.id}">👍 도움돼요 ${review.likes > 0 ? review.likes : ''}</button>
                <button class="review-btn comment-btn" data-id="${review.id}">💬 댓글쓰기</button>
              </div>
              <div class="review-comment-form" id="commentForm-${review.id}" style="display:none; margin-top:10px; background:#fff; border:1px solid #ede5da; padding:10px; border-radius:8px;">
                <input type="text" id="commentInput-${review.id}" placeholder="여기에 대댓글을 입력하세요..." style="width:100%; border:1px solid #c4b5a8; padding:8px; border-radius:4px; box-sizing:border-box; margin-bottom:8px; font-size:12px; font-family:inherit; outline:none;">
                <div style="display:flex; justify-content:flex-end; gap:5px;">
                  <button class="cancel-comment-btn" data-id="${review.id}" style="padding:5px 10px; font-size:12px; background:white; border:1px solid #c4b5a8; border-radius:4px; cursor:pointer; color:#5a4b3c;">취소</button>
                  <button class="submit-comment-btn" data-id="${review.id}" style="padding:5px 10px; font-size:12px; background:#e87a7a; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">등록</button>
                </div>
              </div>
            `;
            
            reviewListContainer.appendChild(card);
        });

        // 이벤트 리스너 재등록
        document.querySelectorAll('.helpful-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                const r = reviews.find(rv => rv.id === id);
                if (r) {
                    if(!btn.classList.contains('active')) {
                        r.likes++;
                        btn.classList.add('active');
                        btn.style.color = '#c97b2e';
                        btn.innerHTML = `👍 도움돼요 ${r.likes}`;
                    } else {
                        r.likes--;
                        btn.classList.remove('active');
                        btn.style.color = '';
                        btn.innerHTML = `👍 도움돼요 ${r.likes > 0 ? r.likes : ''}`;
                    }
                }
            });
        });

        document.querySelectorAll('.comment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const form = document.getElementById(`commentForm-${id}`);
                if(form) {
                    form.style.display = form.style.display === 'none' ? 'block' : 'none';
                    if(form.style.display === 'block') {
                        document.getElementById(`commentInput-${id}`).focus();
                    }
                }
            });
        });

        document.querySelectorAll('.cancel-comment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const form = document.getElementById(`commentForm-${id}`);
                const input = document.getElementById(`commentInput-${id}`);
                if(form) form.style.display = 'none';
                if(input) input.value = '';
            });
        });

        document.querySelectorAll('.submit-comment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                const r = reviews.find(rv => rv.id === id);
                const input = document.getElementById(`commentInput-${id}`);
                if (r && input) {
                    const text = input.value.trim();
                    if (text !== '') {
                        r.comments.push({ author: '사용자', text: text });
                        renderReviews();
                    } else {
                        alert('댓글 내용을 입력해주세요.');
                    }
                }
            });
        });
        
        updateReviewSummary();
    }

    function updateReviewSummary() {
        if(reviews.length === 0) return;
        let totalScore = 0;
        let scoreCounts = { 1:0, 2:0, 3:0, 4:0, 5:0 };
        
        reviews.forEach(r => {
            totalScore += r.rating;
            scoreCounts[r.rating]++;
        });
        
        const avg = (totalScore / reviews.length).toFixed(1);
        const scoreNumber = document.querySelector('.score-number');
        if (scoreNumber) scoreNumber.textContent = avg;
        
        const scoreStars = document.querySelector('.score-stars');
        if (scoreStars) scoreStars.textContent = getStarsHTML(Math.round(totalScore / reviews.length));
        
        const reviewTitle = document.querySelector('.review-title');
        if (reviewTitle) reviewTitle.textContent = `구매 후기 (${reviews.length.toLocaleString()})`;

        for(let i=5; i>=1; i--) {
             const pct = Math.round((scoreCounts[i] / reviews.length) * 100);
             const barRows = document.querySelectorAll('.bar-row');
             if(barRows.length >= 5) {
                 const barRow = barRows[5 - i];
                 const barFill = barRow.querySelector('.bar-fill');
                 if(barFill) barFill.style.width = pct + '%';
             }
        }
    }

    if (reviewSortSelect) {
        reviewSortSelect.addEventListener('change', renderReviews);
    }
    
    const myPetFilterCheck = document.getElementById('myPetFilterCheck');
    if (myPetFilterCheck) {
        myPetFilterCheck.addEventListener('change', renderReviews);
    }

    // 리뷰 작성 UI 로직
    const writeReviewBtn = document.getElementById('writeReviewBtn');
    const reviewWriteForm = document.getElementById('reviewWriteForm');
    const cancelReviewBtn = document.getElementById('cancelReviewBtn');
    const submitReviewBtn = document.getElementById('submitReviewBtn');
    const newReviewRating = document.getElementById('newReviewRating');
    const newReviewText = document.getElementById('newReviewText');

    if (writeReviewBtn && reviewWriteForm) {
        writeReviewBtn.addEventListener('click', () => {
            reviewWriteForm.style.display = 'block';
            writeReviewBtn.style.display = 'none';
        });
        cancelReviewBtn.addEventListener('click', () => {
            reviewWriteForm.style.display = 'none';
            writeReviewBtn.style.display = 'block';
            newReviewText.value = '';
        });
        submitReviewBtn.addEventListener('click', () => {
            const text = newReviewText.value.trim();
            if(!text) {
                alert('리뷰 내용을 입력해주세요!');
                return;
            }
            
            const rating = parseInt(newReviewRating.value);
            const today = new Date();
            const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
            
            const newReview = {
                id: Date.now(),
                author: "고객님",
                petInfo: "등록된 펫 정보 없음",
                rating: rating,
                date: dateStr,
                content: text,
                likes: 0,
                photos: [],
                comments: []
            };
            
            reviews.unshift(newReview);
            
            // 등록하면 자동으로 최신순 보기
            if (reviewSortSelect) reviewSortSelect.value = 'newest';
            renderReviews();
            
            reviewWriteForm.style.display = 'none';
            writeReviewBtn.style.display = 'block';
            newReviewText.value = '';
            
            alert('소중한 구매 후기가 등록되었습니다!');
        });
    }


    // 장바구니 제어 이벤트 (전체선택, 선택삭제, 전체삭제)
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            cartItems.forEach(item => item.checked = isChecked);
            renderCartItems();
        });
    }

    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (cartItems.length === 0) return;
            if (confirm('장바구니를 모두 비우시겠습니까?')) {
                cartItems = [];
                cartCount = 0;
                const cartBadge = document.getElementById('cartBadge');
                if (cartBadge) cartBadge.textContent = 0;
                renderCartItems();
            }
        });
    }

    const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', () => {
            const checkedCount = cartItems.filter(item => item.checked !== false).length;
            if (checkedCount === 0) {
                alert('선택된 상품이 없습니다.');
                return;
            }
            if (confirm(`선택하신 ${checkedCount}개 상품을 삭제하시겠습니까?`)) {
                cartItems = cartItems.filter(item => item.checked === false);
                cartCount = cartItems.length;
                const cartBadge = document.getElementById('cartBadge');
                if (cartBadge) cartBadge.textContent = cartCount;
                renderCartItems();
            }
        });
    }

    // 데이터 로드 후 초기 렌더링
    setTimeout(() => {
        renderReviews();
        renderCartRecommend();
    }, 100);

    // 상세페이지 하단 탭 전환 로직 (구매후기, FAQ, 교환/반품)
    const detailTabBtns = document.querySelectorAll('.detail-tab-btn');
    const detailTabContents = document.querySelectorAll('.detail-tab-content');

    detailTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 모든 탭 버튼 비활성화 (스타일 원복)
            detailTabBtns.forEach(b => {
                b.classList.remove('active');
                b.style.color = '#c4b5a8';
                b.style.fontWeight = '600';
                b.style.borderBottom = '2px solid transparent';
            });

            // 클릭된 탭 활성화 (스타일 적용)
            btn.classList.add('active');
            btn.style.color = '#e87a7a';
            btn.style.fontWeight = '700';
            btn.style.borderBottom = '2px solid #e87a7a';

            // 모든 컨텐츠 숨김
            detailTabContents.forEach(content => {
                content.style.display = 'none';
            });

            // 대상 컨텐츠 보이기
            const targetId = btn.dataset.target;
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.style.display = 'block';
            }
        });
    });
    // 상세페이지 첫구매 쿠폰 발급 버튼 이벤트
    const firstPurchaseCouponBtn = document.getElementById('firstPurchaseCouponBtn');
    if (firstPurchaseCouponBtn) {
        firstPurchaseCouponBtn.addEventListener('click', () => {
            if (isFirstPurchaseCouponApplied) {
                alert('이미 신규가입 5,000원 쿠폰을 발급받아 적용 중입니다!');
                return;
            }
            alert('🎉 신규가입 5,000원 쿠폰이 발급되었습니다! 장바구니/결제 시 자동으로 할인됩니다.');
            isFirstPurchaseCouponApplied = true;
            renderCartItems(); // 장바구니에 이미 담긴 상품이 있다면 즉시 할인 반영
        });
    }

    // 커스텀 공유하기 모달 이벤트
    const shareButton = document.getElementById('shareButton');
    const shareModal = document.getElementById('shareModal');
    const closeShareModalBtn = document.getElementById('closeShareModalBtn');
    const shareProductNameText = document.getElementById('shareProductNameText');

    if (shareButton && shareModal) {
        shareButton.addEventListener('click', () => {
            const productName = document.getElementById('detailName').textContent || '추천 상품';
            if (shareProductNameText) {
                shareProductNameText.textContent = `[댕냥메디] ${productName}`;
            }
            shareModal.style.display = 'flex';
            // 약간의 애니메이션 효과 (선택적)
            shareModal.style.opacity = '0';
            setTimeout(() => {
                shareModal.style.transition = 'opacity 0.2s ease-in-out';
                shareModal.style.opacity = '1';
            }, 10);
        });
    }

    if (closeShareModalBtn && shareModal) {
        closeShareModalBtn.addEventListener('click', () => {
            shareModal.style.opacity = '0';
            setTimeout(() => {
                shareModal.style.display = 'none';
            }, 200);
        });
    }

    // 모달 배경 클릭 시 닫기
    if (shareModal) {
        shareModal.addEventListener('click', (e) => {
            if (e.target === shareModal) {
                closeShareModalBtn.click();
            }
        });
    }

    // 각 플랫폼별 공유 기능 함수 (글로벌 스코프)

    // 공유할 URL과 텍스트를 가져오는 헬퍼 (index.html의 공유 함수에서도 접근 가능하도록 window에 노출)
    function getShareData() {
        const productName = (document.getElementById('detailName') || {}).textContent || '댕냥메디 추천 상품';
        const shareUrl = window.location.href;
        const shareText = `[댕냥메디] ${productName} - 우리 아이 건강을 위한 맞춤 케어 솔루션`;
        return { productName, shareUrl, shareText };
    }
    window.getShareData = getShareData;

    // shareToKakao: index.html 하단 인라인 스크립트에서 정의하므로 폴백만 유지
    if (!window.shareToKakao) {
        window.shareToKakao = function() {
            const { shareUrl } = getShareData();
            const _closeBtn = document.getElementById('closeShareModalBtn');
            const kakaoStoryUrl = `https://story.kakao.com/share?url=${encodeURIComponent(shareUrl)}`;
            window.open(kakaoStoryUrl, '_blank', 'width=500,height=600');
            if (_closeBtn) _closeBtn.click();
        };
    }

    window.shareToInsta = function() {
        const { shareUrl, shareText } = getShareData();

        // 인스타그램은 외부 URL 직접 공유를 지원하지 않음
        // 대신 링크를 클립보드에 복사 후 인스타 앱 오픈
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        navigator.clipboard.writeText(shareUrl).then(() => {
            if (isMobile) {
                // 인스타그램 앱 딥링크 (스토리 공유)
                window.location.href = 'instagram://story-camera';
                setTimeout(() => {
                    window.open('https://www.instagram.com/', '_blank');
                }, 1500);
                alert('📋 링크가 복사되었습니다!\n인스타그램 앱에서 스토리나 게시물에 붙여넣기 해주세요.');
            } else {
                window.open('https://www.instagram.com/', '_blank');
                alert('📋 링크가 복사되었습니다!\n인스타그램에 붙여넣기 해주세요.');
            }
        }).catch(() => {
            // 클립보드 실패 시 웹 열기만
            window.open('https://www.instagram.com/', '_blank');
            alert('📷 인스타그램이 열렸습니다!\n상품 링크: ' + shareUrl);
        });
        if (closeShareModalBtn) closeShareModalBtn.click();
    };

    window.shareToThreads = function() {
        const { shareUrl, shareText } = getShareData();
        // Threads 공식 공유 URL 방식
        const threadsShareUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`;
        window.open(threadsShareUrl, '_blank', 'width=600,height=700');
        if (closeShareModalBtn) closeShareModalBtn.click();
    };

    window.copyShareLink = function() {
        const { shareUrl } = getShareData();

        // Web Share API 지원 기기에서 네이티브 공유 시트 우선 실행
        if (navigator.share) {
            const { productName, shareText } = getShareData();
            navigator.share({
                title: `[댕냥메디] ${productName}`,
                text: shareText,
                url: shareUrl
            }).then(() => {
                if (closeShareModalBtn) closeShareModalBtn.click();
            }).catch((err) => {
                if (err.name !== 'AbortError') {
                    // 공유 취소가 아닌 오류일 때만 클립보드로 대체
                    fallbackCopyLink(shareUrl);
                }
            });
            return;
        }
        fallbackCopyLink(shareUrl);
    };

    function fallbackCopyLink(url) {
        navigator.clipboard.writeText(url).then(() => {
            alert('🔗 상품 링크가 복사되었습니다!\n원하는 곳에 붙여넣기 해보세요.');
            if (closeShareModalBtn) closeShareModalBtn.click();
        }).catch(() => {
            // clipboard API도 안 될 때 input 임시 생성으로 복사
            const tempInput = document.createElement('input');
            tempInput.value = url;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            alert('🔗 상품 링크가 복사되었습니다!\n원하는 곳에 붙여넣기 해보세요.');
            if (closeShareModalBtn) closeShareModalBtn.click();
        });
    }

    // 결제창 웰컴 쿠폰팩 적용 체크박스 이벤트
    const useCouponCheckbox = document.getElementById('useCouponCheckbox');
    if (useCouponCheckbox) {
        useCouponCheckbox.addEventListener('change', () => {
            renderCartItems(); // 장바구니 렌더링 시점에 체크박스 상태를 읽어 할인 반영
        });
    }

    const useDpCouponCheckbox = document.getElementById('useDpCouponCheckbox');
    const dpCouponWrap = document.getElementById('dpCouponWrap');
    if (useDpCouponCheckbox) {
        useDpCouponCheckbox.addEventListener('change', () => {
            if (typeof renderCartItems === 'function') renderCartItems();
        });
        
        if (dpCouponWrap) {
            dpCouponWrap.addEventListener('click', (e) => {
                if (e.target === useDpCouponCheckbox || e.target.tagName.toLowerCase() === 'label') return;
                useDpCouponCheckbox.checked = !useDpCouponCheckbox.checked;
                useDpCouponCheckbox.dispatchEvent(new Event('change'));
            });
        }
    }

    const couponMagnetBtn = document.getElementById('couponMagnetBtn');
    if (couponMagnetBtn && useCouponCheckbox) {
        couponMagnetBtn.addEventListener('click', (e) => {
            // 체크박스나 라벨을 직접 누른 경우는 중복 실행 방지
            if (e.target === useCouponCheckbox || e.target.id === 'useCouponLabel') return;
            useCouponCheckbox.checked = !useCouponCheckbox.checked;
            renderCartItems();
        });
    }

    // 토스페이먼츠 결제 성공 리다이렉트 처리
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
        const cartFlowModal = document.getElementById('cartFlowModal');
        if (cartFlowModal) {
            openCartFlowStep('stepSuccess', '결제 완료', '60%');
            cartItems = [];
            cartCount = 0;
            const cartBadge = document.getElementById('cartBadge');
            if (cartBadge) cartBadge.textContent = '0';
            renderCartItems();
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    } else if (urlParams.get('payment') === 'fail') {
        alert('결제에 실패하였습니다. 다시 시도해주세요.');
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // ===== 클리닉 비포&애프터 후기 강아지/고양이 탭 전환 기능 =====
    const revTabBtns = document.querySelectorAll('.rev-tab-btn');
    const dogRevs = document.querySelectorAll('.dog-rev');
    const catRevs = document.querySelectorAll('.cat-rev');

    revTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            revTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            if (filter === 'dog') {
                dogRevs.forEach(r => r.style.display = 'block');
                catRevs.forEach(r => r.style.display = 'none');
            } else if (filter === 'cat') {
                dogRevs.forEach(r => r.style.display = 'none');
                catRevs.forEach(r => r.style.display = 'block');
            }
        });
    });
});
