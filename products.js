// 댕냥메디 통합 상품 데이터베이스 (40종 제품)
const MOCK_PRODUCTS = {
    '관절 케어': [
        {
            id: 'joint_01',
            name: '관절 튼튼 프리미엄 츄어블', price: '24,000원', discount: '15%', desc: '슬개골 탈구 예방에 도움을 주는 프리미엄 관절 영양제입니다.', img: 'joint_supplements.png', deepDiveImg: 'joint_care_deep_dive_1780622104931.png',
            features: ['휴먼그레이드 원료', '초소형 츄어블 사이즈', '수의사 공동개발', '인공색소 無첨가'],
            ingredients: [
                { icon: '🦴', name: '글루코사민', desc: '관절 및 연골 건강에 도움' },
                { icon: '🐟', name: '초록입홍합', desc: '관절 염증 완화' },
                { icon: '🧪', name: 'MSM', desc: '연골 조직 재생 촉진' }
            ],
            recommend: ['슬개골 탈구 예방이 필요한 아이', '계단 오르내리기를 힘들어하는 아이', '노령기에 접어든 노령견']
        },
        {
            id: 'joint_02',
            name: '슬개골 보충제 초록입홍합 파우더', price: '19,500원', discount: '10%', desc: '관절 염증 완화와 영양 공급에 효과적인 고함량 파우더입니다.', img: 'cat_supplement.png', deepDiveImg: 'joint_care_deep_dive_1780622104931.png',
            features: ['100% 뉴질랜드산 초록입홍합', '파우더 형태로 급여 편리', '연골 보호막 성분 강화'],
            ingredients: [
                { icon: '🐟', name: '초록입홍합', desc: '관절 부종 및 통증 완화' },
                { icon: '🧪', name: '콘드로이친', desc: '연골 기질 재생 지원' }
            ],
            recommend: ['알약이나 츄어블을 안 먹는 아이', '관절염 초기 증상이 있는 아이']
        },
        {
            id: 'joint_03',
            name: '상어연골 슬개골 콘드로이친', price: '32,000원', discount: '20%', desc: '상어 연골 추출 성분으로 관절 세포막을 튼튼하게 보호합니다.', img: 'joint_supplements.png', deepDiveImg: 'joint_care_deep_dive_1780622104931.png',
            features: ['순수 상어연골 추출물', '콘드로이친 황산 고함량', '관절 가동 범위 확대'],
            ingredients: [
                { icon: '🦴', name: '상어연골 분말', desc: '골밀도 강화 및 연골 재생' },
                { icon: '🌱', name: '보스웰리아', desc: '강력한 항염 효과' }
            ],
            recommend: ['슬개골 탈구 2기 이상 진행된 아이', '보행 자세가 불균형한 아이']
        },
        {
            id: 'joint_04',
            name: '튼튼관절 보스웰리아 껌', price: '15,000원', discount: '5%', desc: '천연 보스웰리아 성분으로 씹으면서 관절 and 치석을 동시에 케어합니다.', img: 'dental_care.png', deepDiveImg: 'joint_care_deep_dive_1780622104931.png',
            features: ['보스웰리아 함유', '치석 케어 병행', '인공 향료 무첨가'],
            ingredients: [
                { icon: '🌿', name: '보스웰리아', desc: '관절 소염 및 통증 경감' },
                { icon: '🦷', name: '천연 셀룰로오스', desc: '물리적 치석 긁어내기' }
            ],
            recommend: ['관절 예방과 양치질이 동시에 필요한 아이', '오래 씹는 놀이를 좋아하는 아이']
        },
        {
            id: 'joint_05',
            name: '조인트케어 멀티 비타민', price: '28,000원', discount: '15%', desc: '뼈 건강 필수 영양 성분과 종합 비타민을 한 알로 챙기는 영양제입니다.', img: 'dog_treats.png', deepDiveImg: 'joint_care_deep_dive_1780622104931.png',
            features: ['종합 영양 밸런스', '칼슘/인 황금비율', '기호성 좋은 닭고기 맛'],
            ingredients: [
                { icon: '🥛', name: '해조 칼슘', desc: '천연 뼈 건강 보강' },
                { icon: '💊', name: '멀티 비타민 A/D/E', desc: '종합 면역 활성' }
            ],
            recommend: ['성장기 영양 보충이 필요한 아이', '뼈와 관절이 모두 약해진 노령견']
        }
    ],
    '눈물/눈병': [
        {
            id: 'eye_01',
            name: '아이케어 클린 파우더', price: '18,500원', discount: '10%', desc: '눈물 자국과 눈 건강을 챙겨주는 기호성 좋은 파우더입니다.', img: 'eye_cleanser.png', deepDiveImg: 'eye_care_deep_dive_1780622116993.png',
            features: ['눈물 자국 완화', '기호성 최상 파우더', '루테인 다량 함유', '무방부제/무첨가'],
            ingredients: [
                { icon: '🌻', name: '루테인', desc: '시력 보호 및 눈 건강 유지' },
                { icon: '🫐', name: '빌베리', desc: '항산화 및 눈 피로 회복' },
                { icon: '🌱', name: '결명자', desc: '안구 건조증 개선' }
            ],
            recommend: ['눈물 자국이 착색되어 고민인 아이', '눈곱이 자주 끼는 아이', '안구 건조증이 있는 노령견/묘']
        },
        {
            id: 'eye_02',
            name: '순한 눈물자국 지우개 세정제', price: '14,000원', discount: '15%', desc: '눈가 가려움과 분비물을 부드럽고 닦아내어 변색과 짓무름을 원천 방지합니다.', img: 'cat_eye_care-Photoroom.png', deepDiveImg: 'eye_care_deep_dive_1780622116993.png',
            features: ['EWG 그린등급 포뮬러', '눈가 자극 최소화', '천연 세정 성분'],
            ingredients: [
                { icon: '🌿', name: '병풀 추출물', desc: '손상된 눈가 피부 진정 및 재생' },
                { icon: '💧', name: '편백수', desc: '눈가 세균 억제 및 항균 작용' }
            ],
            recommend: ['눈물 냄새가 유독 심한 아이', '눈가 털 변색이 짙어지는 아이']
        },
        {
            id: 'eye_03',
            name: '루테인 베리 안구 영양제', price: '24,000원', discount: '20%', desc: '루테인과 아스타잔틴이 배합되어 망막 건강과 노안을 예방하는 츄어블입니다.', img: 'cat_supplement.png', deepDiveImg: 'eye_care_deep_dive_1780622116993.png',
            features: ['노안 및 백내장 예방', '초소형 츄어블 제형', '고함량 안토시아닌'],
            ingredients: [
                { icon: '👁️', name: '루테인', desc: '망막 보호 및 블루라이트 차단' },
                { icon: '🦐', name: '아스타잔틴', desc: '강력한 안구 항산화 및 피로 개선' }
            ],
            recommend: ['눈이 점점 뿌옇게 흐려지는 노령견', '어두운 곳에서 잘 부딪히는 아이']
        },
        {
            id: 'eye_04',
            name: '초롱초롱 빌베리 아이즈 츄', price: '22,000원', discount: '10%', desc: '눈 피로 개선과 수분 공급을 돕는 맛있는 간식형 영양 츄입니다.', img: 'dog_treats.png', deepDiveImg: 'eye_care_deep_dive_1780622116993.png',
            features: ['빌베리 추출물 풍부', '말랑한 제형으로 급여 용이', '천연 블루베리 향'],
            ingredients: [
                { icon: '🫐', name: '빌베리', desc: '안구 혈행 개선 및 시력 보호' },
                { icon: '🧪', name: '오메가3', desc: '안구 건조 및 염증 완화' }
            ],
            recommend: ['눈이 자주 충혈되는 예민한 아이', '바람 부는 날 눈물이 많이 나는 아이']
        },
        {
            id: 'eye_05',
            name: '아이클린 안심 면봉 & 패드', price: '9,800원', discount: '5%', desc: '눈가 이물질과 눈곱을 위생적으로 닦아낼 수 있는 일회용 위생 키트입니다.', img: 'eye_cleanser.png', deepDiveImg: 'eye_care_deep_dive_1780622116993.png',
            features: ['100% 순면 개별 포장', '위생적인 일회용 타입', '눈가 pH 맞춤 세정수 촉촉'],
            ingredients: [
                { icon: '💧', name: '정제수 & 히알루론산', desc: '순하고 촉촉한 노폐물 세정' },
                { icon: '🌱', name: '녹차수', desc: '안구 주변 탈취 및 항염' }
            ],
            recommend: ['산책 후 눈곱 정리 시 위생이 걱정되는 집사', '여행 시 간편한 눈가 관리를 원하는 분']
        }
    ],
    '피부/보송': [
        {
            id: 'skin_01',
            name: '피부 진정 천연 샴푸', price: '21,000원', discount: '20%', desc: '가려움을 완화하고 털을 보송하게 만들어주는 천연 샴푸입니다.', img: 'dog_shampoo.png', deepDiveImg: 'skin_care_deep_dive_1780622129024.png',
            features: ['EWG 그린 등급', '자연 유래 계면활성제', '피부 자극 테스트 완료', '알러지 프리 향료'],
            ingredients: [
                { icon: '🌿', name: '병풀 추출물', desc: '상처 치유 및 피부 진정' },
                { icon: '💧', name: '세라마이드', desc: '피부 장벽 강화 및 보습' },
                { icon: '🥥', name: '코코넛 오일', desc: '천연 세정 및 모질 개선' }
            ],
            recommend: ['자주 긁거나 발을 핥는 아이', '건조해서 각질이 많이 일어나는 아이', '목욕 후 피부가 붉어지는 예민한 아이']
        },
        {
            id: 'skin_02',
            name: '촉촉 보습 발바닥 밤', price: '16,000원', discount: '15%', desc: '산책 후 거칠어지고 갈라진 발바닥 패드에 수분과 오일막을 채우는 안심 밤입니다.', img: 'paw_balm.png', deepDiveImg: 'skin_care_deep_dive_1780622129024.png',
            features: ['100% 천연 식물성 오일', '핥아도 무해한 휴먼그레이드', '스틱형으로 바르기 간편'],
            ingredients: [
                { icon: '🍯', name: '시어버터', desc: '강력한 각질 보습 및 연화' },
                { icon: '🐝', name: '비즈왁스', desc: '피부 보호막 형성 및 습진 예방' }
            ],
            recommend: ['산책 후 발바닥이 건조해 바스락거리는 아이', '발바닥을 자꾸 핥아 습진이 걱정되는 아이']
        },
        {
            id: 'skin_03',
            name: '아토피 진정 시카 미스트', price: '18,500원', discount: '10%', desc: '피부 발진과 붉은 기를 즉각적으로 진정시켜주는 고수분 미스트입니다.', img: 'skin_care.png', deepDiveImg: 'skin_care_deep_dive_1780622129024.png',
            features: ['정제수 대신 병풀추출물 베이스', '끈적임 없는 흡수', '수시로 분사 가능'],
            ingredients: [
                { icon: '🌱', name: '시카 (Cica)', desc: '피부 자극 진정 및 장벽 재건' },
                { icon: '🧪', name: '판테놀', desc: '수분 유지력 향상 및 장벽 강화' }
            ],
            recommend: ['배나 겨드랑이에 붉은 반점이 생기는 아이', '잦은 긁음으로 피부가 짓무른 아이']
        },
        {
            id: 'skin_04',
            name: '세라마이드 모질 강화 컨디셔너', price: '23,000원', discount: '12%', desc: '푸석하고 엉키는 모발에 단백질 및 유분 보호막을 입히는 프리미엄 헤어 팩입니다.', img: 'dog_shampoo.png', deepDiveImg: 'skin_care_deep_dive_1780622129024.png',
            features: ['모질 엉킴 방지', '실크 아미노산 함유', '윤기 및 볼륨 강화'],
            ingredients: [
                { icon: '🥚', name: '실크 단백질', desc: '모발 영양 공급 및 큐티클 복구' },
                { icon: '💧', name: '세라마이드 NP', desc: '피부 및 모발 장벽 수분 홀딩' }
            ],
            recommend: ['모발이 가늘어 자주 엉키는 장모종', '정전기가 심하게 일어나는 아이']
        },
        {
            id: 'skin_05',
            name: '허브 솔트 약용 입욕제', price: '19,000원', discount: '15%', desc: '각질 배출과 피부 속 노폐물 정리를 돕는 릴렉싱 스파 입욕제입니다.', img: 'cat_supplement.png', deepDiveImg: 'skin_care_deep_dive_1780622129024.png',
            features: ['사해 소금 미네랄', '천연 라벤더 오일 함유', '피부 각질 연화'],
            ingredients: [
                { icon: '🧂', name: '사해염', desc: '피부 미네랄 공급 및 묵은 각질 제거' },
                { icon: '🌾', name: '오트밀 분말', desc: '피부 가려움 완화 및 천연 보습 효과' }
            ],
            recommend: ['각질(비듬)이 눈에 띄게 많이 날리는 아이', '가벼운 스파로 심신 안정이 필요한 아이']
        }
    ],
    '헤어볼/소화': [
        {
            id: 'hair_01',
            name: '헤어볼 릴리프 캣그라스 플러스', price: '15,000원', discount: '5%', desc: '고양이 헤어볼 배출을 원활하게 돕는 캣그라스 츄어블입니다.', img: 'cat_hairball.png', deepDiveImg: 'hairball_care_deep_dive_1780622143508.png',
            features: ['천연 식이섬유 함유', '소화 기능 개선', '유기농 캣그라스 사용', '인공색소 無첨가'],
            ingredients: [
                { icon: '🌾', name: '유기농 캣그라스', desc: '헤어볼의 부드러운 배출 유도' },
                { icon: '🦠', name: '차전자피', desc: '장내 털 뭉침 방지' },
                { icon: '🧪', name: '가수분해 단백질', desc: '알러지 걱정 없는 소화' }
            ],
            recommend: ['그루밍을 많이 해서 구토가 잦은 아이', '헤어볼 배출에 어려움을 겪는 아이', '소화기가 약한 노령묘']
        },
        {
            id: 'hair_02',
            name: '장 건강 생유산균 프로바이오틱스', price: '26,000원', discount: '15%', desc: '100억 마리 보장 유산균으로 소화 불량과 묽은 변을 즉시 잡아줍니다.', img: 'digestive_care.png', deepDiveImg: 'hairball_care_deep_dive_1780622143508.png',
            features: ['신바이오틱스 포뮬러', '장 도달률 높은 코팅 기술', '배변 냄새 감소'],
            ingredients: [
                { icon: '🦠', name: '프로바이오틱스', desc: '장내 유익균 증가 및 유해균 억제' },
                { icon: '🍌', name: '프리바이오틱스', desc: '유산균의 먹이가 되어 증식 촉진' }
            ],
            recommend: ['변비가 있거나 묽은 변을 자주 보는 아이', '소화 불량으로 방귀를 자주 뀌는 아이']
        },
        {
            id: 'hair_03',
            name: '헤어볼 프리미엄 겔 튜브', price: '18,000원', discount: '10%', desc: '겔 타입으로 급여가 매우 편리하며, 헤어볼을 부드럽고 매끄럽게 응가로 배출시킵니다.', img: 'cat_supplement.png', deepDiveImg: 'hairball_care_deep_dive_1780622143508.png',
            features: ['기호성 최고 짜먹는 제형', '식물성 유성 성분', '장내 윤활 작용'],
            ingredients: [
                { icon: '🥑', name: '식물성 오일 분말', desc: '장벽 윤활을 통한 자연스러운 털 배출' },
                { icon: '✨', name: '타우린', desc: '고양이 필수 아미노산 공급' }
            ],
            recommend: ['풀 형태의 캣그라스를 먹지 않는 아이', '헤어볼 토를 하려다 실패하고 헛구역질만 하는 아이']
        },
        {
            id: 'hair_04',
            name: '유기농 보리싹 헤어볼 츄어블', price: '14,500원', discount: '8%', desc: '천연 보리새싹 분말로 비타민과 식이섬유를 간편하게 섭취하는 바삭한 간식형 영양제입니다.', img: 'cat_hairball.png', deepDiveImg: 'hairball_care_deep_dive_1780622143508.png',
            features: ['국내산 유기농 보리새싹', '바삭바삭한 크런치 식감', '헤어볼 방지'],
            ingredients: [
                { icon: '🌱', name: '보리새싹 분말', desc: '장내 식이섬유 공급 및 소화 촉진' },
                { icon: '🌾', name: '귀리 식이섬유', desc: '배변 활동 촉진 및 장 청소' }
            ],
            recommend: ['말랑한 츄어블보다 바삭한 과자 식감을 선호하는 냥이', '비만 방지 및 섬유질 섭취가 필요한 아이']
        },
        {
            id: 'hair_05',
            name: '소화 효소 듬뿍 동결건조 트릿', price: '22,000원', discount: '12%', desc: '신선한 닭가슴살에 천연 파파인 소화 효소를 코팅하여 소화 흡수율을 높인 트릿입니다.', img: 'cat_treats.png', deepDiveImg: 'hairball_care_deep_dive_1780622143508.png',
            features: ['100% 원물 동결건조', '천연 소화효소 코팅', '무방부제/무향료'],
            ingredients: [
                { icon: '🍍', name: '파파인 & 브로멜라인', desc: '단백질 분해를 통한 소화 효율 극대화' },
                { icon: '🍗', name: '무항생제 닭고기', desc: '고단백 저지방 안심 원물' }
            ],
            recommend: ['사료를 급히 먹고 자주 토하는 토쟁이 냥이/댕이', '영양가 높은 천연 간식을 원하는 분']
        }
    ],
    '신장/요로': [
        {
            id: 'kidney_01',
            name: '유리너리 케어 습식 캔', price: '32,000원', discount: '12%', desc: '풍부한 수분으로 신장 건강과 원활한 배뇨를 돕는 처방식입니다.', img: 'digestive_care.png', deepDiveImg: 'urinary_care_deep_dive_1780622154584.png',
            features: ['높은 수분 함유량', '나트륨/인 제한', '기호성 좋은 고기 육수', '방광 결석 예방'],
            ingredients: [
                { icon: '💦', name: '청정수 80% 이상', desc: '자발적 수분 섭취 부족 해결' },
                { icon: '🍒', name: '크랜베리 추출물', desc: '요로 감염 예방 및 항균' },
                { icon: '🧪', name: '오메가-3', desc: '신장 염증 수치 완화' }
            ],
            recommend: ['물을 너무 적게 마시는 고양이', '방광염 병력이 있는 아이', '신장 수치 관리가 필요한 노령묘']
        },
        {
            id: 'kidney_02',
            name: '크랜베리 요로 건강 분말', price: '24,500원', discount: '10%', desc: '크랜베리 추출 D-만노스가 함유되어 요로 벽에 유해균이 흡착되는 것을 방지합니다.', img: 'cat_supplement.png', deepDiveImg: 'urinary_care_deep_dive_1780622154584.png',
            features: ['요로 유해균 배출', 'D-만노스 배합', '사료에 뿌리는 고운 분말'],
            ingredients: [
                { icon: '🍒', name: '크랜베리', desc: '요로 항균 및 방광 건강 보호' },
                { icon: '🧪', name: 'D-만노스', desc: '유해균을 흡착하여 소변 배출 유도' }
            ],
            recommend: ['소변을 볼 때 낑낑거리거나 아파하는 아이', '결석 예방을 조기에 하고 싶은 묘주']
        },
        {
            id: 'kidney_03',
            name: '신장 케어 저단백 처방 파우치', price: '28,000원', discount: '15%', desc: '신장에 부담을 주는 인과 단백질을 최저 수준으로 설계한 처방용 습식 수프입니다.', img: 'digestive_care.png', deepDiveImg: 'urinary_care_deep_dive_1780622154584.png',
            features: ['신장 질환(CKD) 처방식', '인을 0.1% 미만으로 제한', '음수량 대폭 향상'],
            ingredients: [
                { icon: '🧪', name: '저칼륨/저인 설계', desc: '신장 부담 완화 및 신진대사 개선' },
                { icon: '💧', name: '코코넛 워터', desc: '자연스러운 전해질 균형 공급' }
            ],
            recommend: ['신부전 진단을 받은 만성 신장 질환 묘', '식사 때마다 수분 보충이 절실한 아이']
        },
        {
            id: 'kidney_04',
            name: '방광염 예방 활수 공급 드롭', price: '19,000원', discount: '5%', desc: '물에 희석해 마시는 액상 영양제로, 신장 필터링 능력을 돕고 소변량을 증가시킵니다.', img: 'skin_care.png', deepDiveImg: 'urinary_care_deep_dive_1780622154584.png',
            features: ['간편한 음수량 강제 공급', '무색무취 기호성 방해無', '이뇨 작용 촉진'],
            ingredients: [
                { icon: '🌿', name: '민들레 뿌리 추출물', desc: '자연스러운 이뇨 작용으로 노폐물 배출' },
                { icon: '🧬', name: '방광 점막 장벽', desc: '방광 점막 장벽 강화 및 결석 예방' }
            ],
            recommend: ['음수량이 너무 부족해 방광염이 재발하는 아이', '신장 노폐물 필터링 강화가 필요한 노령묘']
        },
        {
            id: 'kidney_05',
            name: '신장 서포트 수분 충전 츄', price: '22,500원', discount: '10%', desc: '신장 기능 보호를 돕는 허브 성분과 유산균이 말랑말랑한 츄어블 제형에 함유되었습니다.', img: 'cat_treats.png', deepDiveImg: 'urinary_care_deep_dive_1780622154584.png',
            features: ['말랑한 소프트 츄', '신장 내 독소 배출 도움', '나트륨 제한식'],
            ingredients: [
                { icon: '🌱', name: '아스트라갈루스 (황기)', desc: '신장 혈류 개선 및 기능 강화' },
                { icon: '🦠', name: '장 유산균', desc: '장내 질소 폐기물 감소로 신장 독성 완화' }
            ],
            recommend: ['가루형이나 약액을 완강히 거부하는 까다로운 냥이', '미리 요로와 신장 건강을 함께 지키고 싶은 묘주']
        }
    ],
    '피부/모질': [
        {
            id: 'coat_01',
            name: '오메가3 연어 오일 드롭', price: '28,000원', discount: '25%', desc: '푸석한 털을 윤기나게 관리해주는 고순도 연어 오일입니다.', img: 'skin_care.png', deepDiveImg: 'omega3_care_deep_dive_1780622168454.png',
            features: ['노르웨이산 연어 오일', '펌프형 급여 편리', '비린내 최소화 공법', '피부/모질 개선'],
            ingredients: [
                { icon: '🐟', name: '순수 연어 오일', desc: '오메가-3 및 오메가-6 풍부' },
                { icon: '✨', name: '비타민 E', desc: '오일 산화 방지 및 항산화' },
                { icon: '🧪', name: 'EPA & DHA', desc: '피부 염증 완화 및 모질 개선' }
            ],
            recommend: ['털이 푸석하고 비듬이 생기는 아이', '윤기 나는 코트를 원하는 묘주', '면역력 저하로 피부염이 잦은 아이']
        },
        {
            id: 'coat_02',
            name: '오메가3 연어 오일 스틱', price: '29,000원', discount: '20%', desc: '스틱 파우치 포장으로 신선하게 한 포씩 짜먹는 오메가3 영양제입니다.', img: 'omega3_stick.png', deepDiveImg: 'omega3_care_deep_dive_1780622168454.png',
            features: ['개별 스틱 포장', '산패 위험 제로', '휴대가 간편한 영양제'],
            ingredients: [
                { icon: '🐟', name: '정제 연어 유제', desc: '기호성이 우수한 크림 제형 연어유' },
                { icon: '🧪', name: '아연 (Zinc)', desc: '피부 재생 촉진 및 상처 완화' }
            ],
            recommend: ['오일을 개봉하면 매번 산패할까 봐 고민이신 분', '사료 위에 흘리지 않고 깔끔하게 짜주고 싶은 분']
        },
        {
            id: 'coat_03',
            name: '모질 개선 콜라겐 츄', price: '19,500원', discount: '10%', desc: '피부 진피층을 구성하는 콜라겐 성분이 가득하여 털 빠짐을 획기적으로 줄여줍니다.', img: 'cat_treats.png', deepDiveImg: 'omega3_care_deep_dive_1780622168454.png',
            features: ['어류 콜라겐 분자 적용', '모근 강화 효과', '피부 건조감 완화'],
            ingredients: [
                { icon: '🐟', name: '피쉬 콜라겐', desc: '피부 탄력 및 모근 밀착력 강화' },
                { icon: '🧬', name: '엘라스틴', desc: '피부 보습 장벽의 핵심 기질 형성' }
            ],
            recommend: ['털 빠짐이 너무 심해 온 집안에 털이 날리는 냥이', '피부가 건조해 껍질 같은 각질이 일어나는 아이']
        },
        {
            id: 'coat_04',
            name: '고양이 모질 전용 에센스 미스트', price: '16,000원', discount: '15%', desc: '그루밍 후의 털 엉킴을 부드럽게 방지하고 영양 성분을 코팅해주는 에센스 스프레이입니다.', img: 'skin_care.png', deepDiveImg: 'omega3_care_deep_dive_1780622168454.png',
            features: ['무알콜/무자극 포뮬러', '정전기 방지 효과', '은은한 천연 아로마 향'],
            ingredients: [
                { icon: '🧪', name: '실크 아미노산', desc: '모발 영양 코팅 및 정전기 차단' },
                { icon: '🌾', name: '귀리 커넬 추출물', desc: '피부 자극성 완화 및 장벽 보습' }
            ],
            recommend: ['정전기 때문에 터치를 하면 깜짝 놀라는 고양이', '장모 묘로서 털이 수시로 뭉치고 엉키는 아이']
        },
        {
            id: 'coat_05',
            name: '연어 콜라겐 스킨 앤 코트 파우더', price: '25,000원', discount: '12%', desc: '연어 분말과 피쉬 콜라겐을 결합하여 사료 기호성까지 극대화하는 멀티 모질 파우더입니다.', img: 'cat_supplement.png', deepDiveImg: 'omega3_care_deep_dive_1780622168454.png',
            features: ['초미세 나노 분말', '사료 기호성 촉진제', '피부 재생 솔루션'],
            ingredients: [
                { icon: '🐟', name: '연어 파우더', desc: '천연 오메가3 지방산 및 아미노산 공급' },
                { icon: '🧬', name: '비오틴 (Biotin)', desc: '피부, 모근, 손톱 세포 활성 촉진' }
            ],
            recommend: ['털에 윤기가 전혀 없고 부슬부슬해진 아이', '피부염을 앓고 난 뒤 털이 덜 자란 부위가 있는 아이']
        }
    ],
    '면역력 UP': [
        {
            id: 'immune_01',
            name: '데일리 멀티 비타민 영양제', price: '26,000원', discount: '10%', desc: '우리 아이 기초 체력과 면역력을 높여주는 종합 영양제입니다.', img: 'dog_treats.png', deepDiveImg: 'immunity_care_deep_dive_1780622181011.png',
            features: ['12가지 비타민 함유', '기호성 높은 스틱형', '면역력 증진', '수분 섭취 도움'],
            ingredients: [
                { icon: '💊', name: '종합 비타민 A, B, C', desc: '기초 체력 및 면역 활성화' },
                { icon: '🍄', name: '배타글루칸', desc: '면역 세포 촉진' },
                { icon: '🦠', name: '유산균', desc: '장내 면역력 강화' }
            ],
            recommend: ['잔병치레가 많고 면역력이 떨어진 아이', '수술 후 회복기인 아이', '기초 체력 보충이 필요한 노령 반려동물']
        },
        {
            id: 'immune_02',
            name: '면역력 강화 홍삼 진액 에센스', price: '35,000원', discount: '15%', desc: '반려동물 전용으로 특허받은 발효 홍삼 사포닌 성분이 기력을 충전해 줍니다.', img: 'cat_supplement.png', deepDiveImg: 'immunity_care_deep_dive_1780622181011.png',
            features: ['국산 6년근 홍삼 추출액', '사포닌 사포나제 흡수율 특화', '기력 보강 솔루션'],
            ingredients: [
                { icon: '🍂', name: '발효 홍삼 사포닌', desc: '피로 개선 및 면역력 세포 증진' },
                { icon: '🍯', name: '천연 아카시아 꿀', desc: '기호성 보완 및 항균 항산화 작용' }
            ],
            recommend: ['노화로 인해 부쩍 활동량이 줄고 잠만 자는 노령 아이', '환절기마다 감기나 바이러스성 안구 질환에 잘 걸리는 아이']
        },
        {
            id: 'immune_03',
            name: '스피루리나 슈퍼푸드 면역 파우더', price: '23,000원', discount: '10%', desc: '지구상에서 가장 오래된 조류인 스피루리나의 5대 영양소가 면역 장벽을 지켜줍니다.', img: 'digestive_care.png', deepDiveImg: 'immunity_care_deep_dive_1780622181011.png',
            features: ['항산화 물질 피코시아닌 풍부', '엽록소의 강력한 세포 보호', '알레르기 개선'],
            ingredients: [
                { icon: '🌿', name: '유기농 스피루리나', desc: '항산화, 면역 증강 및 해독 작용' },
                { icon: '🧬', name: '셀레늄', desc: '유해 활성산소로부터 세포 보호' }
            ],
            recommend: ['피부나 장염 등 만성적인 염증성 질환이 있는 아이', '몸안의 중금속 등 독소 정화가 필요한 아이']
        },
        {
            id: 'immune_04',
            name: '엘라이신 면역 증진 츄어블', price: '21,500원', discount: '8%', desc: '고양이 허피스 바이러스 억제에 특효를 지닌 필수 영양소 L-Lysine 영양제입니다.', img: 'dog_treats.png', deepDiveImg: 'immunity_care_deep_dive_1780622181011.png',
            features: ['L-아미노산 면역 솔루션', '눈곱 및 콧물 재발 방지', '부드러운 간식 형태'],
            ingredients: [
                { icon: '🧪', name: 'L-라이신 (Lysine)', desc: '아미노산 합성을 통한 체내 면역력 회복' },
                { icon: '🍊', name: '비타민 C', desc: '세포 산화 방지 및 항바이러스 작용' }
            ],
            recommend: ['만성 허피스(콧물, 눈물)로 고생하는 고양이', '환절기 온도 변화에 면역 보충이 필요한 아이']
        },
        {
            id: 'immune_05',
            name: '초유 성분 튼튼 면역 부스터', price: '29,800원', discount: '12%', desc: '분만 후 24시간 내에 얻은 신선한 초유 단백질(IgG)이 강력한 면역 장벽을 이식해줍니다.', img: 'joint_supplements.png', deepDiveImg: 'immunity_care_deep_dive_1780622181011.png',
            features: ['면역글로불린 IgG 20% 이상 보장', '성장 인자 함유', '우유 단백 알러지 방지 공법'],
            ingredients: [
                { icon: '🥛', name: '뉴질랜드산 젖소 초유', desc: '체내 방어 항체 IgG 다량 공급' },
                { icon: '🧬', name: '아연 & 엽산', desc: '세포 분열과 핵산 대사 지원' }
            ],
            recommend: ['어미 젖을 떼고 막 고형 사료를 먹기 시작한 아기 댕냥이', '선천적으로 골격이 작고 병약한 성장기 아이']
        }
    ],
    '구강/치석': [
        {
            id: 'dental_01',
            name: '덴탈 클리닉 오래먹는 껌', price: '19,000원', discount: '15%', desc: '치석 제거와 입냄새 예방에 탁월한 프리미엄 덴탈츄입니다.', img: 'dental_care.png', deepDiveImg: 'dental_care_deep_dive_1780622195416.png',
            features: ['휴먼그레이드 원료', '치석 제거 특화 형태', '수의사 공동개발', '인공색소 無첨가'],
            ingredients: [
                { icon: '🌿', name: '녹차 추출물', desc: '입냄새 감소 및 구강 항균 작용' },
                { icon: '🦴', name: 'SHMP (치석 억제 성분)', desc: '플라그 축적 예방' },
                { icon: '🧪', name: '스피루리나', desc: '항산화 및 잇몸 염증 완화' }
            ],
            recommend: ['양치를 너무 싫어해서 구강 관리가 힘든 아이', '입냄새가 심해져서 스킨십이 망설여지는 아이', '치석이 자주 쌓이는 아이']
        },
        {
            id: 'dental_02',
            name: '치석 억제 SHMP 바르는 치약', price: '16,500원', discount: '10%', desc: '칫솔질 없이 잇몸과 치아 경계에 쓱 묻혀주기만 해도 구강 내 박테리아와 플라그를 억제해주는 겔 형태 치약입니다.', img: 'eye_cleanser.png', deepDiveImg: 'dental_care_deep_dive_1780622195416.png',
            features: ['바르는 칫솔질 패스', '음식 섭취 전후 사용 편리', '달콤한 바나나향 기호성'],
            ingredients: [
                { icon: '🦴', name: 'SHMP 소듐헥사메타포스페이트', desc: '플라그 석회화(치석화) 차단 기술' },
                { icon: '🍯', name: '천연 꿀벌 프로폴리스', desc: '잇몸 상처 및 구강 염증 항균 보호' }
            ],
            recommend: ['칫솔만 들이대면 입을 꽉 다물고 으르렁거리는 아이', '잇몸이 붉게 붓고 칫솔질 시 피가 잘 나는 아이']
        },
        {
            id: 'dental_03',
            name: '마시는 구강 청결 액상 제제', price: '14,000원', discount: '5%', desc: '마시는 물그릇에 가볍게 섞어만 주어도 하루 종일 구강 항균 탈취 효과를 지키는 올인원 마우스워시입니다.', img: 'skin_care.png', deepDiveImg: 'dental_care_deep_dive_1780622195416.png',
            features: ['매일 마시는 물에 1스푼', '무향/무맛 거부감 제로', '치주 질환 완화'],
            ingredients: [
                { icon: '🌿', name: '유칼립투스 잎수', desc: '구강 유해 박테리아 99.9% 억제' },
                { icon: '🧬', name: '구연산 아연', desc: '치석 생성 주요 성분 흡착 제거' }
            ],
            recommend: ['아주 간편하게 전체적인 구강 위생을 보강하고 싶은 보호자', '잇몸 구취 및 침 흘림이 잦아 입 주변 관리가 필요한 아이']
        },
        {
            id: 'dental_04',
            name: '구강 항균 스피루리나 덴탈 츄', price: '22,000원', discount: '12%', desc: '구강 항균 스피루리나와 톱니바퀴 결이 들어간 껌이 잇몸 틈새 치석을 물리적으로 제거해 줍니다.', img: 'dental_care.png', deepDiveImg: 'dental_care_deep_dive_1780622195416.png',
            features: ['격자 치석 스크랩 형태', '기호성 우수 가수분해 오리', '치주염 예방'],
            ingredients: [
                { icon: '🥬', name: '스피루리나 추출 피코시아닌', desc: '구강 내 유해균 번식 차단 및 항염' },
                { icon: '🧪', name: '키토산', desc: '치주낭 내 세균 감염 예방' }
            ],
            recommend: ['어금니 안쪽의 갈색 치석이 보이기 시작한 아이', '씹는 행위를 통해 턱 근육 발달과 스트레스 해소를 원하는 분']
        },
        {
            id: 'dental_05',
            name: '고농축 허브 구강 스프레이', price: '12,800원', discount: '10%', desc: '즉각적인 구취 제거와 치아 플라그 분해를 돕는 간편한 스프레이입니다.', img: 'eye_cleanser.png', deepDiveImg: 'dental_care_deep_dive_1780622195416.png',
            features: ['치아 분사 즉시 소취', '미국 치과의사 안심 포뮬러', '간편 휴대 스펙'],
            ingredients: [
                { icon: '🌱', name: '페퍼민트 & 세이지', desc: '잇몸 진정 및 구강 입새 악취 원인 탈취' },
                { icon: '🍎', name: '사과산', desc: '치아 표면의 당분 유막 분해 및 침 분비 촉진' }
            ],
            recommend: ['외출 전 급작스러운 스킨십 시 구취가 즉시 신경 쓰일 때', '장거리 이동 시 간편 구강 세정을 대용할 때']
        }
    ]
};
