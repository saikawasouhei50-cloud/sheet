// --- 게임 설정 ---
            let characters = [];
let monsters = {}; // 몬스터는 객체({}) 형태입니다!
let furnitureItems = [];
let eventDungeons = [];
let eventShopItems = [];
			// ==========================================
// 1. 아까 복사한 웹 앱 URL을 따옴표 안에 넣으세요
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxnZkGAJO0DxO3XtxWpHmkOTX6EwO9hkTPUHxD3QTqRFVsv7KjC_IBU8e1vkIVWBECqZw/exec";
// ==========================================

// 2. 데이터를 가져와서 characters 변수에 채워넣는 함수
async function loadGameData() {
    try {
        console.log("데이터 로딩 시작...");
        const response = await fetch(GOOGLE_SHEET_URL);
        const data = await response.json(); // 전체 데이터 보따리를 받음

        // 1. 캐릭터 데이터 조립 (기존과 동일)
        characters = data.characters.map(row => ({
            name: row.name,
            baseName: row.baseName || row.name.split('] ')[1] || row.name,
            rarity: row.rarity,
            faction: row.faction,
            stats: { hp: Number(row.hp), atk: Number(row.atk), def: Number(row.def) },
            imageUrl: row.imageUrl,
            cardImageUrl: row.cardImageUrl || row.imageUrl,
            dialogues: row.dialogues ? String(row.dialogues).split('|') : ['...'],
            skills: [
                { name: row.skill1_name, dialogue: row.skill1_dialogue, power: Number(row.skill1_power), type: row.skill1_type },
                ...(row.skill2_name ? [{ name: row.skill2_name, dialogue: row.skill2_dialogue, power: Number(row.skill2_power), type: row.skill2_type }] : [])
            ],
            deathDialogue: row.deathDialogue,
            story: row.story,
            enhancementSuccessDialogue: row.enhancementSuccessDialogue
        }));

        // 2. 몬스터 데이터 조립 (배열을 객체로 변환: monsters['이름'] 형태)
        monsters = {}; // 초기화
        data.monsters.forEach(row => {
            monsters[row.key] = {
                name: row.name,
                stats: { hp: Number(row.hp), atk: Number(row.atk), def: Number(row.def) },
                imageUrl: row.imageUrl
            };
        });

        // 3. 가구 데이터 조립
        furnitureItems = data.furniture.map(row => ({
            id: row.id,
            name: row.name,
            type: row.type,
            size: { w: Number(row.w), h: Number(row.h) }, // w, h를 묶어서 size 객체로
            cost: Number(row.cost),
            scale: row.scale ? Number(row.scale) : undefined, // scale이 있으면 넣음
            imageUrl: row.imageUrl
        }));

        // 4. 이벤트 던전 조립
        eventDungeons = data.eventDungeons.map(row => ({
            name: row.name,
            monsterName: row.monsterName,
            eventPointReward: Number(row.eventPointReward)
        }));

        // 5. 이벤트 상점 조립 (itemData 연결 로직 필요)
        eventShopItems = data.eventShop.map(row => {
            // 카드인 경우 실제 캐릭터 데이터를 찾아 연결하고, 아니면 숫자 등을 그대로 씀
            let itemData = row.itemData;
            if (row.type === 'card') {
                // 캐릭터 이름으로 캐릭터 데이터 찾기 (데이터가 로드된 이후라 가능)
                const foundChar = characters.find(c => c.name === row.itemData);
                itemData = foundChar || row.itemData; // 못 찾으면 그냥 이름 둠 (에러 방지)
            } else {
                itemData = Number(row.itemData); // 보석 등은 숫자로 변환
            }

            return {
                id: row.id,
                name: row.name,
                type: row.type,
                cost: Number(row.cost),
                limit: Number(row.limit),
                itemData: itemData
            };
        });

        console.log("모든 데이터 로딩 완료!");

    } catch (error) {
        console.error("데이터 로딩 실패:", error);
        alert("데이터를 불러오지 못했습니다. " + error.message);
    }
}
            
            

            const mainChapters = [
    {
        chapterName: '제1장: 서재의 흔적',
        stages: [
            { 
                stageName: '1-1. 오래된 문장', monsterName: '의혹의 안개', rewards: { fountainPens: 20, currency: 5 },
                stageStory: [
                    { character: null, dialogue: '낡은 서재. 책상 위에는 박민준이 마지막으로 썼던 원고가 펼쳐져 있다. 그 원고는 사건 현장의 모든 것을 설명하려는 듯 완벽하게 보였다.' },
                    { character: '서도진', expression: 'neutral', position: 'left', dialogue: '모든 것이 너무 완벽해. 이대로는 경찰이 자살로 종결할 수밖에 없어.' },
                    { character: '도천영', expression: 'serious', position: 'right', dialogue: '우선, 이 현장의 모순을 찾아야 합니다. "의혹의 안개"가 우리를 가로막고 있군요.' }
                ] 
            },
            { 
                stageName: '1-2. 흐릿한 단서', monsterName: '의혹의 안개', rewards: { fountainPens: 25, currency: 5 },
                stageStory: [
                    { character: null, dialogue: '책상 아래에서 오래된 영수증이 발견되었다. 그것은 한 달 전, 박민준이 오른손잡이용 만년필을 구입했다는 증거였다.' },
                    { character: '서도진', expression: 'surprised', position: 'left', dialogue: '역시, 박민준은 왼손잡이야. 이 펜은... 범인이 가져갔거나, 아니면... 증거가 조작된 거지.' }
                ]
            },
            { 
                stageName: '1-3. 모방의 그림자', monsterName: '의혹의 안개', rewards: { fountainPens: 30, currency: 10 },
                stageStory: [
                    { character: '도천영', expression: 'neutral', position: 'right', dialogue: '현장에 남은 잉크 얼룩은 세 가지 종류입니다. 하나는 박민준의 것, 다른 하나는... 범인의 것, 그리고 나머지 하나는 모방의 흔적입니다.' },
                    { character: '서도진', expression: 'serious', position: 'left', dialogue: '세 번째 잉크가 이 사건의 열쇠군. 범인은 자신이 아닌 누군가의 흔적을 모방해 남겼어. 교활한 그림자군.' }
                ]
            },
            { 
                stageName: '1-4. 현장의 재구성', monsterName: '의혹의 안개', rewards: { fountainPens: 35, currency: 10 },
                stageStory: [
                    { character: '한 현', expression: 'neutral', position: 'right', dialogue: '서점 주인인 제가 보기에도, 이 현장의 책 배치는 너무 인위적입니다. 평소 박민준 작가의 습관과 달라요.' },
                    { character: '서도진', expression: 'neutral', position: 'left', dialogue: '범인은 박민준을 잘 아는 사람이야. 하지만 이 현장을 꾸미는 데는 다른 사람의 \'습관\'을 빌려왔지.' } // <-- '습관' 주변의 작은따옴표를 이스케이프 처리 (\')
                ]
            },
            { 
                stageName: '1-5. 용의자의 진술', monsterName: '모방범의 그림자', rewards: { fountainPens: 40, currency: 15 },
                stageStory: [
                    { character: null, dialogue: '가장 유력한 용의자 A는 사건 당시 완벽한 알리바이를 제시했다. 그의 진술은 한 치의 오차도 없었다.' },
                    { character: '박연우', expression: 'neutral', position: 'right', dialogue: '이 구조식처럼, 진술은 완벽한 고리입니다. 하지만 완벽함 자체가 오히려 의심스럽죠.' }
                ]
            },
            { 
                stageName: '1-6. 알리바이의 허점', monsterName: '모방범의 그림자', rewards: { fountainPens: 45, currency: 15 },
                stageStory: [
                    { character: '강은율', expression: 'neutral', position: 'left', dialogue: '용의자 A가 제시한 시간대 시뮬레이션 결과, 그가 주장한 경로를 벗어난 미세한 시간차가 확인되었습니다.' },
                    { character: null, dialogue: '0.001초의 오차. 아무도 주목하지 않았던 그 작은 오차에서 "모방범의 그림자"가 희미하게 모습을 드러냈다.' }
                ]
            },
            { 
                stageName: '1-7. 미제 사건 파일', monsterName: '모방범의 그림자', rewards: { fountainPens: 50, currency: 20 },
                stageStory: [
                    { character: '백정문', expression: 'serious', position: 'right', dialogue: '이전에 발생했던 미제 사건 파일들과 현장의 "에너지 잔류 패턴"이 일치합니다. 단순 모방이 아닐지도 모릅니다.' },
                    { character: '서도진', expression: 'serious', position: 'left', dialogue: '그렇다면 범인은 과거의 사건을 재연하며, 우리에게 어떤 규칙을 강요하고 있는 거야.' }
                ]
            },
            { 
                stageName: '1-8. 침묵의 증인', monsterName: '모방범의 그림자', rewards: { fountainPens: 55, currency: 20 },
                stageStory: [
                    { character: '윤유준', expression: 'neutral', position: 'left', dialogue: '제가 사건 당일 밤, 박민준 작가의 작업실 근처를 지나가는 사람을 봤어요. 어두워서 얼굴은 못 봤지만... 익숙한 실루엣이었어요.' },
                    { character: null, dialogue: '학생의 사소한 증언. 그것은 완벽하게 짜인 범인의 이야기 속에서 유일하게 침묵하지 않은 진실이었다.' }
                ]
            },
            { 
                stageName: '1-9. 숨겨진 의도', monsterName: '모방범의 그림자', rewards: { fountainPens: 60, currency: 25 },
                stageStory: [
                    { character: '독고유진', expression: 'serious', position: 'right', dialogue: '이 모든 것이 작가인 박민준의 소설을 모방한 것이라면, 범인의 최종 목적은 소설의 "완결"일 겁니다.' },
                    { character: '서도진', expression: 'serious', position: 'left', dialogue: '그리고 그 완결의 장소는... 다음 피해자의 집이 되겠지.' }
                ]
            },
            { 
                stageName: '1-10. 장의 결말 (챕터 보스)', monsterName: '날조된 증거', rewards: { fountainPens: 100, currency: 30 },
                stageStory: [
                    { character: null, dialogue: '모든 단서는 윤필규의 이름으로 모였다. 하지만 그 모든 증거는 너무나도 쉽게 발견되었고, 너무나도 명확했다.' },
                    { character: '도천영', expression: 'serious', position: 'right', dialogue: '이 날조된 증거들 속에 감춰진 진범을 찾아야 합니다. 서 작가.' }
                ]
            },
        ],
    },
    {
        chapterName: '제2장: 미궁 속의 실험',
        stages: [
            { 
                stageName: '2-1. 새로운 가설', monsterName: '모방범의 그림자', rewards: { fountainPens: 70, currency: 10 },
                stageStory: [
                    { character: '도천영', expression: 'neutral', position: 'right', dialogue: '박민준의 시신에서 검출된 독성 물질은 매우 희귀합니다. 저는 이를 "D-성분"이라 명명했습니다.' },
                    { character: '서도진', expression: 'neutral', position: 'left', dialogue: 'D-성분이라... 독성 물질이라면 이 사건은 소설 모방이 아닌 화학 물질 실험과 관련이 있다는 건가?' }
                ]
            },
            { 
                stageName: '2-2. 통제된 변수', monsterName: '모방범의 그림자', rewards: { fountainPens: 75, currency: 10 },
                stageStory: [
                    { character: '윤서천', expression: 'neutral', position: 'right', dialogue: 'D-성분은 제가 5년 전 연구하던 물질입니다. 치사량에 이르면 평온한 상태로 죽음에 이르게 하죠. 마치... 완벽한 자살처럼.' },
                    { character: '서도진', expression: 'serious', position: 'left', dialogue: '당신이 범인인가?' },
                    { character: '윤서천', expression: 'neutral', position: 'right', dialogue: '아뇨, 저는 D-성분이 외부로 유출된 것을 알았을 뿐입니다. 그리고 그것을 회수하려 합니다.' }
                ]
            },
            { 
                stageName: '2-3. 예상치 못한 반응', monsterName: '모방범의 그림자', rewards: { fountainPens: 80, currency: 15 },
                stageStory: [
                    { character: '박연우', expression: 'neutral', position: 'left', dialogue: 'D-성분은 특정 환경에서 예상치 못한 화학적 반응을 일으킵니다. 그 반응이 현장의 잉크 얼룩을 변색시켰을 가능성이 있습니다.' },
                    { character: null, dialogue: '사건은 추리 소설의 영역을 넘어 화학 미스터리로 변해가고 있었다.' }
                ]
            },
            { 
                stageName: '2-4. 오염된 샘플', monsterName: '모방범의 그림자', rewards: { fountainPens: 85, currency: 15 },
                stageStory: [
                    { character: '도천영', expression: 'serious', position: 'right', dialogue: '윤서천이 제공한 D-성분의 샘플은 순도가 너무 높습니다. 실제 박민준의 시신에서 발견된 샘플은 다른 물질과 "오염"되어 있었습니다.' },
                    { character: '서도진', expression: 'neutral', position: 'left', dialogue: '그 오염 물질을 아는 사람, 또는 D-성분을 사용한 후 현장을 조작한 사람이 범인이겠군.' }
                ]
            },
            { 
                stageName: '2-5. 연구자의 윤리', monsterName: '날조된 증거', rewards: { fountainPens: 90, currency: 20 },
                stageStory: [
                    { character: '윤서천', expression: 'serious', position: 'right', dialogue: '제 연구는 인류의 고통 없는 종결을 위한 것이었습니다. 하지만 누군가 제 연구를 살인에 악용하고 있어요.' },
                    { character: null, dialogue: '윤서천은 자신의 비윤리적인 연구에 대한 죄책감과, 자신의 의도와 다른 결과를 낳았다는 분노를 동시에 느끼고 있었다.' }
                ]
            },
            { 
                stageName: '2-6. 잊혀진 약물', monsterName: '날조된 증거', rewards: { fountainPens: 95, currency: 20 },
                stageStory: [
                    { character: '양석민', expression: 'neutral', position: 'left', dialogue: 'D-성분과 오염 물질의 결합 경로를 분석했습니다. 이 결합 방식은 10년 전 폐기된 한 실험실에서만 사용되던 방식입니다.' },
                    { character: null, dialogue: '결합 경로를 따라가자, 사건은 과거의 "잊혀진 약물" 실험과 연결되기 시작했다.' }
                ]
            },
            { 
                stageName: '2-7. 배후의 조력자', monsterName: '날조된 증거', rewards: { fountainPens: 100, currency: 25 },
                stageStory: [
                    { character: '도천영', expression: 'serious', position: 'right', dialogue: '윤필규는 박민준의 편집자였고, 윤서천은 박민준의 대학 후배였습니다. 이 모든 사건은 이 세 사람의 관계에서 시작된 것 같습니다.' },
                    { character: '서도진', expression: 'serious', position: 'left', dialogue: '가장 가까운 곳에 있던 조력자가, 사실은 가장 멀리서 조종하는 배후였을 가능성. 소설의 클리셰는 현실에서 반복되는군.' }
                ]
            },
            { 
                stageName: '2-8. 역추적', monsterName: '날조된 증거', rewards: { fountainPens: 105, currency: 25 },
                stageStory: [
                    { character: '강은율', expression: 'neutral', position: 'left', dialogue: '범인이 사용한 컴퓨터의 접속 기록을 역추적했습니다. 그 기록은 윤필규가 아닌, 또 다른 인물을 가리키고 있습니다.' },
                    { character: null, dialogue: '데이터가 던진 새로운 가설. 윤필규는 진범이 아닌, 진범이 이용하려 했던 또 다른 희생양일지도 모른다.' }
                ]
            },
            { 
                stageName: '2-9. 긴급 상황', monsterName: '날조된 증거', rewards: { fountainPens: 110, currency: 30 },
                stageStory: [
                    { character: '윤유준', expression: 'surprised', position: 'right', dialogue: '윤필규 씨가 위험해요! 방금 윤필규 씨 집에서 수상한 빛이 번쩍였어요!' },
                    { character: '서도진', expression: 'angry', position: 'left', dialogue: '젠장! 늦었나? 서둘러야 해!' }
                ]
            },
            { 
                stageName: '2-10. 비극적인 실험 (챕터 보스)', monsterName: '편집된 진실', rewards: { fountainPens: 180, currency: 40 },
                stageStory: [
                    { character: null, dialogue: '윤필규의 집에서 발견된 것은, 편집된 진실이었습니다. 현장은 완벽했고, D-성분의 흔적은 사라지고 없었습니다.' },
                    { character: '서도진', expression: 'serious', position: 'left', dialogue: '범인은 모든 것을 숨겼어. 이제 진범과 정면으로 맞설 수밖에 없다.' }
                ]
            },
        ],
    }, 
];
            
           

           // [이 코드로 기존 const eventStories = [...] 블록 전체를 교체하세요]
const eventStories = [
    {
        title: '고양이 소년',
        content: [
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '이것 좀 보세요.' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '응?' },
            { character: null, dialogue: '노트북 앞에서 다음 문장을 낑낑대며 고민하는 티가 팍팍 나던 도진의 눈앞에 쓱 내밀어진 것은 현의 휴대전화 액정이었다.' },
            { character: null, dialogue: '동영상이 재생되고 있는 액정. 아니, 왼쪽 위에 생방송이라는 글자가 쓰여 있으니 라이브 영상인가.' },
            { character: null, dialogue: '액정 안에서는 정체를 알 수 없는 게임이 한창 진행되고 있었다. 적을 총으로 쏘아 죽이는 게임인 것만은 알아보겠다.' },
            { character: null, dialogue: '누가 하고 있는 게임인지는 모르겠지만 그는 참 실력이 좋다.' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '음…….' },
            { character: null, dialogue: '도진이 정말로 게임 화면만을 보고 있으니 현은 답답하다는 듯이 화면의 오른쪽 아래를 가리켰다. 상반신만 보이는 금발 머리의 고양이 소년이 웃는 얼굴로 몸을 흔들고 있다.' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '응? 이게 뭔데…….' },
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '네?' },
            { character: null, dialogue: '현은 들이밀었던 휴대전화를 제 쪽으로 거뒀다. 게임 화면을 확인한 현이 아 뭐야, 하며 작은 탄식을 뱉었다.' },
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '그새 갈아 끼우긴. 하나 잡았다고 담배라도 피시나?' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '갈아 끼워? 뭘 잡아?' },
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '아녜요, 잠깐만 기다려보세요.' }
        ]
    },
    {
        title: '잘 지내는 걸까?',
        content: [
            { character: null, dialogue: '잠시 곁에 서서 휴대전화를 빤히 내려다보던 현은 이윽고 다시 도진의 코앞에 액정을 들이밀었다.' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '(뭐가 달라진 거지…?)' },
            { character: null, dialogue: '도진이 현의 눈치를 보자 현은 또다시 한쪽 눈썹을 찌그러뜨려선 아까와 똑같은 부분을 손가락으로 짚었다.' },
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '봐요.' },
            { character: null, dialogue: '금발의 고양이 소년은 온데간데없었다.' },
            { character: null, dialogue: '대신 아는 사람의 상반신이 그곳에 있었다.' },
            { character: null, dialogue: '게임에 집중한 듯 눈을 살짝 가늘게 뜬 얼굴은 기억 속의 그와 여전히 똑같았다. 입고 있는 분홍색 후드 티도, 쓰고 있는 고양이 귀 헤드셋도 똑같다.' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '도화 씨, 잘 계시네.' }
        ]
    },
    {
        title: '이상한 낌새',
        content: [
            { character: null, dialogue: '허리에 한 손을 짚고 선 현은 어깨를 으쓱이더니 휴대전화를 도진의 시야에서 거뒀다.' },
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '글쎄요, 과연 잘 계시는 걸까요.' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '여기 계실 때랑 똑같으신데…….' },
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '저 요즘 시간 날 때마다 도화 씨 방송 보고 있는데. 뭔가뭔가 낌새가 이상하다는 말이죠.' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '응? 애청자가 된 거야?' },
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '전 원래도 가끔 봤어요.' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '낌새가 이상하다고?' },
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '예를 들면 이런 거죠.' }
        ]
    },
    {
        title: '반백의 중노동',
        content: [
            { character: null, dialogue: '현은 다시 휴대전화를 조작했다. 카메라 앞에 앉은 도화가 화면에 비친다.' },
            { character: '도화', expression: 'neutral', position: 'left', dialogue: '이사를 하니깐 물건이 어디에 있는지 자꾸 헷갈리는 거 있지?' },
            { character: null, dialogue: '화면 너머로 보이는 도화의 방은 그때와 똑같았다.' },
            { character: null, dialogue: '마치 도화의 방을 실패한 도시의 아파트에서 뚝 떼어내선, 성공한 도시 서울의 이름 모를 아파트에 그대로 가져다 붙인 듯했다.' },
            { character: '도화', expression: 'neutral', position: 'left', dialogue: '아까도 어, 이 밑에 전선이 난리도 아니라 케이블 타이를 찾고 있었거든. 이사 오기 전에는 분명히 근처 서랍에 넣어뒀었는데 오늘 찾아보니까 없데?' },
            { character: '도화', expression: 'neutral', position: 'left', dialogue: '내가 뭐 이삿짐센터를 따로 쓴 것도 아니고 포터만 불러서 싹 옮겨서 일주일 내내 자~알 정리하고 와 이 정도면 진짜 반백치고 중노동 했다 수고했다 백도화 하고.' },
            { character: '도화', expression: 'neutral', position: 'left', dialogue: '짜장면도 한 그릇 먹고 소화도 시킬 겸 2주 정도 푹 쉬고 이제 일상생활로 돌아와서 다시 광대놀음 하려고 각을 잡았는데 어? 자꾸 이런 찐빠들이 나는 거야. 아 말이 안 돼요.' }
        ]
    },
    {
        title: '한순간의 사고',
        content: [
            { character: '서도진', expression: 'neutral', position: 'right', dialogue: '반백 아닐 텐데…….' },
            { character: '한 현', expression: 'neutral', position: 'left', dialogue: '방송적 과장이죠. 옆에 채팅창 보세요.' },
            { character: '서도진', expression: 'neutral', position: 'right', dialogue: '채팅……. ‘형 치매 보험 들었어?’.' },
            { character: '한 현', expression: 'neutral', position: 'left', dialogue: '아니 뭐 그런 걸 읽어요. ‘형 엄살 좀 그만해’, ‘혼자 몇년 일찍 사네’.' },
            { character: '서도진', expression: 'neutral', position: 'right', dialogue: '치매라니…….' },
            { character: '한 현', expression: 'neutral', position: 'left', dialogue: '이제 채팅창 보지 마세요.' },
            { character: null, dialogue: '너스레를 떨며 어깨를 으쓱이던 화면 속의 도화가 쉴 새 없이 올라가는 채팅창을 잠시 주시했다.' },
            { character: null, dialogue: '한 손이 카메라 범위 밖으로 넘어가는가 싶더니 로고 하나 없는 종이컵을 들고 돌아온다.' },
            { character: '도화', expression: 'neutral', position: 'left', dialogue: '치매 보험? 너 내가 추리 게임 단서 조합하는 거 보고도 그런 말이 나오냐.' },
            { character: '도화', expression: 'neutral', position: 'left', dialogue: '엄살 아니라니까? 너희도 가구 옮기고 오만잡걸 다 정리하고 해 봐라. 내가 보장하는데 너흰 2주 안에 못 일어나.' },
            { character: '도화', expression: 'neutral', position: 'left', dialogue: '와 잠실날다람쥐님 이사 비용 오만 원 감사합니다. 이걸 일찍 주셨으면 내가 이삿짐센터를 부르는 건데.' },
            { character: '도화', expression: 'neutral', position: 'left', dialogue: '얘들아 백도화/사건사고가 무슨 말이냐? 자 농담이고 오늘 할 건…… 아!' },
            { character: null, dialogue: '한순간의 사고였다. 채팅창을 보며 낄낄대던 도화가, 들고 있던 종이컵을 허공에 내려둔 것이다. 아마 그보다 조금 앞의 책상에 두려고 했던 거겠지.' },
            { character: null, dialogue: '투명한 생수가 잔 밖으로 흘러넘쳤다. 미간을 찌푸린 도화가 종이컵을 줍기 위해 몸을 앞으로 숙인다.' },
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '스톱!' }
        ]
    },
    {
        title: '붉게 물든 쇄골',
        content: [
            { character: null, dialogue: '현이 액정을 두드려 동영상을 멈췄다. 몸을 숙인 도화의 오뚝한 콧날이 두드러지는 지점이었다.' },
            { character: null, dialogue: '현은 두 손가락을 벌려 동영상의 어느 한 지점을 줌인했다. 후드티 안쪽으로 보이는 쇄골 지점이다. 볼록 튀어나온 목젖이 흐린 그림자를 만들고 움푹 들어간 쇄골의 굴곡이 짙은 그림자를 만드는.' },
            { character: null, dialogue: '분홍색 후드티 안에는 받쳐 입은 게 없는지 그림자가 졌는데도 살색이 노골적이다.' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '뭐, 뭐 하는 거야?' },
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '여길 잘 보시라고요.' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '안 그래도 돼…….' },
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '네? 이상한 소리 하지 마세요. 보시라니깐요.' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '이, 이상한 소리 하지 마!' },
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '예?' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '이러면 안 될 거 같아…….' },
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '아뇨, 안 되는 짓을 하는 건 이렇게 애청자들을 기만하는 백도화 씨죠.' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '기만……?' },
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '그러니까, 여기 보세요.' },
            { character: null, dialogue: '도화의 매끈한 살이 여전히 화면을 가득 채우고 있었지만. 현의 손가락이 닿은 곳은 조금 달랐다.' },
            { character: null, dialogue: '살색이 아니었다.' },
            { character: null, dialogue: '쇄골에서 어깨 쪽으로 조금 떨어진 부근. 후드티로 가려져 잘은 보이지 않지만, 분명 붉게 물들어 있었다.' },
            { character: null, dialogue: '어깨에서 시작된 울긋불긋한 흔적이 옷에 가려 보이지 않는 가슴께까지 길게 번져 있었다.' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '어…….' },
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '멍들었죠.' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '그, 그렇네.' }
        ]
    },
    {
        title: '사라지지 않는 흔적',
        content: [
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '다른 영상에서도 이래요. 이때만 일시적으로 멍이 든 게 아니란 말이죠.' },
            { character: null, dialogue: '액정을 물린 현이 휴대전화를 툭툭 조작했다. 9월 초의 영상과 9월 말의 영상과 10월 초의 영상과…….' },
            { character: null, dialogue: '그 안에서 웃고 화내는 도화의 어깨 부근은 항상 붉게 물들어 있었다.' },
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '이 뒤로는 도화 씨도 뭔가 깨달은 게 있는지 안에 흰 티를 입으시더라고요. 그래서 요즘은 확인할 수가 없어요.' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '그냥 날이 추워져서 한 겹 더 입으신 건 아닐까…….' },
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '집에 있으면 안 춥거든요.' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '(어깨부터 가슴까지 이어진 멍 자국. 꼭 무거운 뭔가를 하루 종일 맨 것처럼 남은 붉은 자국…….)' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '(방송을 하지 않을 땐 누군가한테 협박당해서 천장에 대롱대롱 매달려있기라도 하는 건가…….)' }
        ]
    },
    {
        title: '낮춘 목소리',
        content: [
            { character: null, dialogue: '차량, 하며 출입문에 달린 자그마한 종이 울렸다.' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '(아직 일곱 시도 안 됐는데 필규가 왔나? 그럴 리가 없는데.)' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '(아니면 이 시간에 손님이……?)' },
            { character: null, dialogue: '문 앞에서 익숙한 얼굴의 손님이 멍한 눈을 하고 서 있었다.' },
            { character: null, dialogue: '그는 창가 테이블에 모여 있는 사장과 손님을 잠시 쳐다보다가 고개를 살짝 숙였다.' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '(아, 그 사람이다. 몇 달 전에 이사 온……. 서점에도 자주 들르는…….)' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '(나는 많이 마주친 적 없지만 분명 필규는 출근하면서 자주 뵌다고 했지.)' },
            { character: '윤필규', expression: 'neutral', position: 'right', dialogue: '(학교 선생님이시래요. 경기도에 사시는데 발령이 서울 쪽으로 나서 아예 집을 구하셨다나 봐요.)' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '(처음 보는 사람이랑 그런 얘기도 하고 필규는 정말 대단하지…….)' },
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '어서 오세요.' },
            { character: null, dialogue: '인사를 받은 손님은 곧장 문제집 코너로 걸어갔다.' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '(그러고 보니 현이도 비슷한 얘기를 해 줬어.)' },
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '(고등학교 수학 선생님이시래요. 경기도에 사는데 발령이 서울로 나서 집을 구하셨대요.)' },
            { character: null, dialogue: '손님은 문제집 서가 안으로 몸을 숨겼다. 바스락바스락 스윽 하며 책을 선별하는 소리가 들린다.' },
            { character: null, dialogue: '두 사람은 손님의 기척을 의식하며 시선을 교환하다가, 이내 한껏 목소리를 낮춰 말문을 틀었다.' },
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '낌새가 안 좋죠? 역시. 작가님도 그렇게 생각하시죠?' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '(손님이 있을 땐 작가님이라는 단어를 쓰지 않아 줬으면 좋겠는데.)' },
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '어깨부터 가슴까지 멍이 들 일이 뭐가 있냐고요. 그것도 하루이틀도 아니고 한 달 내내요.' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '으음, 어디 묶여 계시는 거 아냐…….' },
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '그런데 방송할 때는 풀려나고요?' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '그러면, 도화 씨를 묶었다가 풀었다가 하는 상대는 도화 씨의 방송으로 뭔가의 이득을 본다고 봐야 하는데.' },
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '묶어놓는 행위랑 보이게 하는 행위는 경향성이 너무 정반대죠.' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '우리 너무 당연하게 도화 씨가 묶여있다고 전제하고 있는 거 아냐…….' },
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '그럴만한 일을 하시잖아요.' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '그럴만한 일을 하시기는 하지…….' }
        ]
    },
    {
        title: '소중한 배낭',
        content: [
            { character: '선생', expression: 'neutral', position: 'right', dialogue: '계산을 좀 할 수 있을까요?' },
            { character: '한 현', expression: 'neutral', position: 'left', dialogue: '어헉? 네!' },
            { character: null, dialogue: '대체 언제 다가왔는지 모를 손님이 여전히 멍한 눈으로 두 사람을 바라보고 있었다. 한 손에 들린 매끈한 표지의 수학 문제집은 아래로 축 처진 채다.' },
            { character: null, dialogue: '현은 답잖게 허둥지둥 카운터로 돌아갔다. 손님은 그를 뒤따르지 않았다. 도진의 어깨 너머에 있는 무언가를 빤히 보고 있다.' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '(어, 내 노트북 화면을…….)' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '(보고 있어……?)' },
            { character: null, dialogue: '도진이 쾅 하고 노트북을 닫았다.' },
            { character: null, dialogue: '선생은 뿔테 안경 뒤의 졸려 보이는 눈을 한 번 끔뻑이더니 시선을 도진에게로 옮긴다.' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '아, 아, 음, 왜, 아, 안녕하세요?' },
            { character: '선생', expression: 'neutral', position: 'right', dialogue: '소설을 쓰시나요?' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '음, 그, 웨, 웹소설을, 조금.' },
            { character: '선생', expression: 'neutral', position: 'right', dialogue: '그러시군요.' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '저, 계, 계산.' },
            { character: '선생', expression: 'neutral', position: 'right', dialogue: '결혼을 하셨나요?' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '네?' },
            { character: null, dialogue: '손님의 시선이 도진의 얼굴에서 손으로 떨어진다. 도진의 시선 역시 덩달아 추락한다. 왼손 약지에서 반지가 반짝이고 있다.' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '네, 네.' },
            { character: null, dialogue: '도진은 긍정을 표했다. 결혼한 부부와 거진 동일한 생활을 하고 있음이 분명했다.' },
            { character: '선생', expression: 'neutral', position: 'right', dialogue: '아이는요?‘' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '네?' },
            { character: null, dialogue: '헥? 에 가까운 발음이었지만 어찌저찌 의미는 통할 것이었다.' },
            { character: null, dialogue: '손님을 기다리던 현은 불길하다는 표정을 만면에 걸고는 슬금슬금 이쪽으로 돌아오고 있었다.' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '어, 없, 없는데요.' },
            { character: '선생', expression: 'neutral', position: 'right', dialogue: '그러시군요.' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '그, 그건 갑자기, 왜, 물어보시는지…….' },
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '손님, 계산해 드릴게요.' },
            { character: null, dialogue: '도진을 빤히 내려다보던 그가 뒤를 휙 돌았다. 그 기세에 현도 흠칫하며 뒤로 한 걸음 물러난다.' },
            { character: '선생', expression: 'neutral', position: 'right', dialogue: '사장님은 결혼을 안 하셨지요?' },
            { character: null, dialogue: '고저가 그다지 없는 나긋한 톤의 목소리는 학생들을 지도하는 데에 한 역할 톡톡히 할 것 같다. 사람을 겁박하는 데에도 쓸모가 있을 것 같다는 문제가 있긴 하다.' },
            { character: null, dialogue: '현은 비즈니스 미소가 되다 만 애매한 미소를 입가에 걸고 만다.' },
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '네, 아직 상대가 없어서.' },
            { character: null, dialogue: '그러는 선생님은요, 하듯이 손님의 왼손으로 노골적인 시선을 보낸다.' },
            { character: null, dialogue: '도진도 따라 훔쳐보면, 그의 손에는 아무런 치장이 되어 있지 않다.' },
            { character: null, dialogue: '시선을 느낀 그는 제 왼손을 들어 내려다보더니.' },
            { character: '선생', expression: 'neutral', position: 'right', dialogue: '저는 했었습니다.' },
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '아, 이거 실례가…….' },
            { character: '선생', expression: 'neutral', position: 'right', dialogue: '아닙니다. 안사람은 떠났어도 딸아이랑 같이 열심히 살아가고 있으니까요.' },
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '아, 따님이?' },
            { character: '선생', expression: 'neutral', position: 'right', dialogue: '네. 지금은 고등학교 기숙사에서 타지 생활을 하고 있습니다만……. 항상 마음은 함께죠.' },
            { character: '선생', expression: 'neutral', position: 'right', dialogue: '그래서인지, 저는 알 것 같군요. 어깨와 가슴의 붉은 멍 말입니다.' },
            { character: '한 현', expression: 'neutral', position: 'right', dialogue: '네? 아니, 그걸 다 듣고 계셨어요?' },
            { character: '선생', expression: 'neutral', position: 'right', dialogue: '아, 예……. 귀는 닫을 수 없는 법이라서요.' },
            { character: null, dialogue: '손님은 들고 있던 커다란 문제집을 옆구리에 끼었다.' },
            { character: '선생', expression: 'neutral', position: 'right', dialogue: '저도 그런 멍이 한때 생겼던 적이 있습니다. 전혀 익숙하지 않은 걸 매일 같이 매어야 했을 때가 있었거든요.' },
            { character: '선생', expression: 'neutral', position: 'right', dialogue: '끈이 짧아서 불편한 배낭이면 차라리 다행이죠. 어떻게든 편한 자세를 찾아서 매면 되는 일이니까요.' },
            { character: '선생', expression: 'neutral', position: 'right', dialogue: '하지만 그건 제가 편해서는 안 되는 배낭이었습니다. 배낭이 편한 자세를 찾아 그 자세를 유지해야만 했어요.' },
            { character: '선생', expression: 'neutral', position: 'right', dialogue: '그렇지 않으면 소중한 배낭에게 탈이 날 수도 있으니까…….' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '(어라……? 설마, 아니…….)' },
            { character: null, dialogue: '눈동자를 굴리니 경악을 숨기지 못하는 현의 얼굴이 시야의 가장자리에 비쳤다.' },
            { character: null, dialogue: '도진은 눈을 질끈 감고 고개를 돌렸다.' },
            { character: '서도진', expression: 'neutral', position: 'left', dialogue: '(아아, 거짓말……. 설마 굳이 서울까지 이사하신 이유도…….)' },
            { character: '선생', expression: 'neutral', position: 'right', dialogue: '두 분이 아이가 없으셔서 깨닫지 못하신 것 같습니다. 저는 바로 떠오르더군요. 그건 아기띠의 자국이라고.' }
        ]
    },
    {
        title: '왼손의 반지',
        content: [
            { character: null, dialogue: '엘리베이터에 선객이 있었다. 몇 달 전 최상층으로 이사 온 이웃이다.' },
            { character: null, dialogue: '그는 엘리베이터 문간을 넘는 필규를 보고 작게 고개를 숙여 인사했다. 필규도 덩달아 목례한다.' },
            { character: '윤필규', expression: 'neutral', position: 'left', dialogue: '안녕하세요, 날이 부쩍 추워졌네요.' },
            { character: '선생', expression: 'neutral', position: 'right', dialogue: '정말요, 아이들도 겉옷을 챙기기 시작하더군요.' },
            { character: '선생', expression: 'neutral', position: 'right', dialogue: '난방을 틀어달라고 성화입니다. 아직은 낮 기온이 따뜻해서 그럴 수 없다고 해도 억지를 부리는 게 참 아이들 다워요.' },
            { character: null, dialogue: '필규는 순수하게 마음에서 우러나온 미소를 짓는다. 아이들, 이라는 단어에서 연상되는 푸릇한 이미지가 있었다.' },
            { character: null, dialogue: '엘리베이터는 곧 지상에 다다른다. 문이 열리고 필규가 먼저 발걸음을 옮겼다.' },
            { character: '윤필규', expression: 'neutral', position: 'left', dialogue: '그럼 좋은 하루 되세요.' },
            { character: null, dialogue: '고개를 돌려 등 뒤의 이웃에게 가볍게 인사를 건넸다.' },
            { character: '선생', expression: 'neutral', position: 'right', dialogue: '아아 예, 좋은 하루 되세요.' },
            { character: null, dialogue: '왠지 시선을 아래로 보내고 있던 그가 적당히 인사를 받았다.' },
            { character: '윤필규', expression: 'neutral', position: 'left', dialogue: '(뭘 보고 계셨던 거지?)' },
            { character: null, dialogue: '상함을 느끼기도 잠시, 관성적으로 자가용에 올라타 시동을 건 필규는 폭이 썩 넓지 않은 아파트 정문을 지나 도로 다운 도로로 나간 뒤에야 그의 시선이 어디에 닿아 있었는지를 깨달았다.' },
            { character: null, dialogue: '운전대 위의 왼손에서 어떤 함의를 띤 반지가 아침의 희끄무레한 빛을 받아 반짝이고 있었다.' }
        ]
    }
];

// ✅ 1단계: 아래 코드를 game_data.js 파일에 추가하세요.

// [이 코드로 기존 const eventStoryPart2 = {...} 블록 전체를 교체하세요]
const eventStoryPart2 = {
    // --- 전반부 스토리 (선택지 때문에 이 부분은 필요합니다) ---
    firstHalf: [
        // 장면 0
        {
            character: '서도진', expression: 'serious', position: 'left',
            dialogue: '사건 현장에서 두 개의 결정적인 증거가 나왔어. 하나는 피해자의 다잉 메시지, 다른 하나는... 용의자의 지문이 묻은 찻잔이야.'
        },
        // 장면 1
        {
            character: '도천영', expression: 'neutral', position: 'right',
            dialogue: '데이터는 거짓말을 하지 않죠. 하지만 다잉 메시지는 해석의 여지가 있고, 지문은 조작될 수 있습니다.'
        },
        // 장면 2
        {
            character: null,
            dialogue: '두 개의 상반된 단서. 어떤 것을 더 신뢰해야 할까?'
        },
        // 장면 3 (선택지)
        {
            character: '서도진', expression: 'neutral', position: 'left',
            dialogue: '이제 선택해야 해. 어떤 증거를 중심으로 수사를 진행할지...',
            choices: [
                { text: '다잉 메시지를 믿는다.', nextScene: 4 },
                { text: '결정적인 지문을 믿는다.', nextScene: 5 }
            ]
        },
        // 장면 4 (분기 1: 다잉 메시지)
        {
            character: null,
            dialogue: '당신은 피해자가 마지막 힘을 다해 남긴 메시지에 더 무게를 두기로 했다.',
            jumpTo: 6 
        },
        // 장면 5 (분기 2: 지문)
        {
            character: null,
            dialogue: '당신은 과학적이고 물리적인 증거인 지문을 더 신뢰하기로 했다.',
            jumpTo: 6 
        },
        // 장면 6 (공통 장면)
        {
            character: '서도진', expression: 'serious', position: 'left',
            dialogue: '좋아, 그 방향으로 수사를 진행하지. 우리의 선택이 어떤 결과로 이어질지는... 아직 아무도 몰라.',
            choices: [
                {
                    text: '전반부 스토리 완료',
                    statId: 'event_part2_final_choice',
                    isFinalChoice: true
                }
            ]
        }
    ],
    // --- 후반부 스토리 (미니 이벤트이므로 비워둡니다) ---
    secondHalf: [] // <--- 이 부분을 빈 배열로 만듭니다.
};

            


            // ✅ 이 코드로 기존 mainStories 변수 전체를 교체해주세요.
            const mainStories = [
                {
                    title: '프롤로그: 비 내리는 밤',
                    dungeonToUnlock: null,
                    content: [
                        { character: '서도진', expression: 'angry', position: 'left', dialogue: '젠장, 이럴 때가 아닌데...' },
                        { character: null, dialogue: '스스로에게 짜증을 내며 펜을 고쳐 쥐는 순간이었다. 쿵, 쿵, 쿵. 낡은 현관문이 둔탁하게 울렸다.' },
                        { character: '도천영', expression: 'serious', position: 'right', dialogue: '서 작가, 오랜만이군. 혹시... 박민준하고 연락 닿았나?' },
                        { character: '서도진', expression: 'surprised', position: 'left', dialogue: '아니, 그 녀석은 마감 때면 동굴로 들어가는 놈이잖아. 왜?' },
                        { character: '도천영', expression: 'serious', position: 'right', dialogue: '오늘 밤, 박민준이 죽었어.' },
                        { character: '서도진', expression: 'surprised', position: 'left', dialogue: '...' }
                    ]
                },
                {
                    title: '1장: 첫 번째 사건',
                    dungeonToUnlock: '1-10', // ✅ '제1장'의 마지막 스테이지 클리어 조건
                    content: [
                        { character: null, dialogue: '박민준의 작업실은... 기묘했다. 마치 누군가 연출이라도 한 것처럼, 모든 것이 지나치게 깔끔했다.' },
                        { character: null, dialogue: '흩어진 원고들, 쓰러진 잉크병, 심지어는 바닥에 그어진 핏자국까지도 마치 정교하게 계산된 소품처럼 보였다.' },
                        { character: '도천영', expression: 'serious', position: 'right', dialogue: '자살로 종결될 것 같군. 유서도 발견됐고, 외부 침입의 흔적도 없으니.' },
                        { character: '서도진', expression: 'serious', position: 'left', dialogue: '아니, 이건 자살이 아니야. 이건... 메시지야.' },
                        { character: null, dialogue: '그의 눈이 작업실 한구석, 박민준이 아끼던 한정판 만년필 케이스에 멈췄다. 케이스는 비어 있었다.' },
                        { character: '서도진', expression: 'neutral', position: 'left', dialogue: '박민준은 왼손잡이였어. 하지만 바닥에 떨어진 펜은 오른손잡이용이야.' },
                        { character: '도천영', expression: 'neutral', position: 'right', dialogue: '그리고 그가 마지막으로 집필하던 원고의 제목은, \'완벽한 자살\'이라...' },
                        { character: '서도진', expression: 'serious', position: 'left', dialogue: '이건 자살로 위장된 타살이야. 범인은 박민준의 소설을 모방해서 현장을 꾸민거고.' },
                        { character: '도천영', expression: 'serious', position: 'right', dialogue: '좋아. 경찰이 안 움직인다면, 우리가 직접 움직이면 되지. 나와 함께 이 소설의 결말을 확인해 보겠나?' }
                    ]
                },
                {
                    title: '2장: 어둠 속의 조력자',
                    dungeonToUnlock: '2-10', // ✅ '제2장'의 마지막 스테이지 클리어 조건
                    content: [
                        { character: null, dialogue: '수사는 난항에 부딪혔다. 용의선상은 넓었고, 범인이 남긴 단서는 교묘하게 조작된 것들뿐이었다.' },
                        { character: '서도진', expression: 'neutral', position: 'left', dialogue: '막다른 길이군...' },
                        { character: null, dialogue: '그때, 의문의 전화 한 통이 걸려왔다. 자신을 \'의사\'라고만 밝힌 목소리는 박민준의 시신에서 특수한 성분이 검출되었다는 정보를 흘렸다.' },
                        { character: null, dialogue: '그리고 그 성분을 만들 수 있는 사람은 극소수라는 말과 함께 낡은 연구소의 주소를 남기고는 전화를 끊었다.' },
                        { character: '도천영', expression: 'neutral', position: 'right', dialogue: '반신반의하며 찾아간 연구소는 폐허나 다름없군.' },
                        { character: null, dialogue: '하지만 그곳에서 두 사람은 뜻밖의 인물과 마주친다. 윤서천. 한때 촉망받는 화학자였으나, 비윤리적인 실험으로 학계에서 퇴출된 남자였다.' },
                        { character: '서도진', expression: 'surprised', position: 'left', dialogue: '당신이 왜 여기에...?' }
                    ]
                },
                {
                    title: '3장: 마지막 퍼즐',
                    dungeonToUnlock: null, // ✅ 예시: 3장은 아직 구현되지 않았으므로 null
                    content: [
                        { character: '서도진', expression: 'neutral', position: 'left', dialogue: '계속해서 위화감이 느껴져. 현장에서 발견된 단서들, 의사의 제보, 윤서천의 알리바이까지...' },
                        { character: '서도진', expression: 'serious', position: 'left', dialogue: '모든 것이 너무나도 완벽하게 맞아떨어지는 게 오히려 부자연스러워. 마치 잘 짜인 각본처럼.' },
                        { character: null, dialogue: '그 순간, 도천영에게서 전화가 걸려왔다. 박민준의 유서 필적이, 그의 담당 편집자였던 윤필규의 필적과 상당 부분 일치한다는 감정 결과가 나왔다는 것이다.' },
                        { character: '도천영', expression: 'serious', position: 'right', dialogue: '윤필규... 언제나 묵묵히 두 사람의 뒤에서 작품을 도왔던 남자. 그는 언제나 조용했고, 눈에 띄지 않았지.' },
                        { character: '서도진', expression: 'surprised', position: 'left', dialogue: '하지만 그랬기에, 모두를 속일 수 있었던 건가...!' },
                        { character: '서도진', expression: 'serious', position: 'left', dialogue: '이 비극적인 소설의 진정한 작가는, 바로 가장 가까이에 있었던 그였어.' },
                        { character: null, dialogue: '이제 남은 것은 마지막 장을 넘기는 것뿐이었다. 진실이라는 이름의, 잔혹한 결말을.' }
                    ]
                }
            ];

            // --- 업적 데이터 (수정 및 보상 추가) ---
            const achievements = [
                // 1. 뽑기 관련
                { id: 'ach_001', title: '첫걸음', description: '누군가의 서고에서 1회 뽑기', condition: (state) => state.stats.totalPulls >= 1, reward: { currency: 10 } },
                { id: 'ach_002', title: '수집의 시작', description: '누군가의 서고에서 10회 뽑기', condition: (state) => state.stats.totalPulls >= 10, reward: { currency: 50 } },
                { id: 'ach_003', title: '대량 집필', description: '누군가의 서고에서 50회 뽑기', condition: (state) => state.stats.totalPulls >= 50, reward: { currency: 100 } },
                
                // 2. 카드 획득 관련
                { id: 'ach_004', title: '인연의 실', description: '등장인물 10종류 수집', condition: (state) => new Set(state.inventory.map(c => c.name)).size >= 10, reward: { currency: 50 } },
                { id: 'ach_005', title: '탐정의 자질', description: 'SSR 등급 등장인물 1장 획득', condition: (state) => state.inventory.some(c => c.rarity === 'SSR'), reward: { currency: 100 } },
                
                // 3. 성장/육성 관련
                { id: 'ach_007', title: '퇴고의 기본', description: '등장인물을 1회 퇴고하기', condition: (state) => state.inventory.some(c => c.level >= 1), reward: { fountainPens: 50 } }, // ✨ 보상 추가 (만년필 50개)
                { id: 'ach_008', title: '개정판 입문', description: '개정 레벨이 1 이상인 카드 1장 보유', condition: (state) => state.inventory.some(c => c.revision >= 1), reward: { currency: 70 } },
                { id: 'ach_009', title: '최고의 필력', description: 'SSR 카드를 최대 레벨(+9)까지 퇴고', condition: (state) => state.inventory.some(c => c.rarity === 'SSR' && c.level >= 9), reward: { currency: 200 } },
                
                // 4. 전투/스테이지 관련
                { id: 'ach_010', title: '첫 독서', description: '스테이지 1-1 클리어', condition: (state) => state.clearedStages.includes('1-1'), reward: { fountainPens: 50 } }, // ✨ 보상 추가 (만년필 50개)
                { id: 'ach_011', title: '1장 완독', description: '제1장(1-10) 모두 클리어', condition: (state) => state.clearedStages.includes('1-10'), reward: { bookmarks: 5 } },
                { id: 'ach_012', title: '2장 완독', description: '제2장(2-10) 모두 클리어', condition: (state) => state.clearedStages.includes('2-10'), reward: { bookmarks: 10 } },
                
                // 5. 기타 기능/재화 관련
                { id: 'ach_013', title: '넓어진 서재', description: '보관함 1회 확장', condition: (state) => state.capacity > 100, reward: { currency: 30 } },
                { id: 'ach_014', title: '잉크 부자', description: '만년필 1,000개 이상 보유', condition: (state) => state.fountainPens >= 1000, reward: { currency: 100 } },
            ];
			
			// --- 인연(Synergy) 데이터 ---
            const synergies = [
                {
                    name: '탐정과 조수',
                    description: '덱 전체 HP +10%',
                    condition: (deck) => deck.some(c => c.faction === '탐정') && deck.some(c => c.faction === '조수'),
                    applyBonus: (card) => { card.stats.hp = Math.floor(card.stats.hp * 1.10); }
                },
                {
                    name: '쫓는 자와 쫓기는 자',
                    description: '덱 전체 ATK +10%',
                    condition: (deck) => deck.some(c => c.faction === '탐정') && deck.some(c => c.faction === '범인'),
                    applyBonus: (card) => { card.stats.atk = Math.floor(card.stats.atk * 1.10); }
                },
                {
                    name: '편집자와 소설가',
                    description: '서도진 & 윤필규 ATK +15',
                    condition: (deck) => deck.some(c => c.baseName === '서도진') && deck.some(c => c.baseName === '윤필규'),
                    applyBonus: (card) => { if (card.baseName === '서도진' || card.baseName === '윤필규') card.stats.atk += 15; }
                },
                {
                    name: '우애 나쁜 형제',
                    description: '윤필규 & 윤서천 DEF +15',
                    condition: (deck) => deck.some(c => c.baseName === '윤필규') && deck.some(c => c.baseName === '윤서천'),
                    applyBonus: (card) => { if (card.baseName === '윤필규' || card.baseName === '윤서천') card.stats.def += 15; }
                },
                {
                    name: '저 없으면 안 되죠?',
                    description: '서도진 & 한 현 HP +20%',
                    condition: (deck) => deck.some(c => c.baseName === '서도진') && deck.some(c => c.baseName === '한 현'),
                    applyBonus: (card) => { if (card.baseName === '서도진' || card.baseName === '한 현') card.stats.hp = Math.floor(card.stats.hp * 1.20); }
                },
                {
                    name: '눈앞에서 사람이 떨어졌다',
                    description: '윤서천 & 도천영 ATK +12%',
                    condition: (deck) => deck.some(c => c.baseName === '윤서천') && deck.some(c => c.baseName === '도천영'),
                    applyBonus: (card) => { if (card.baseName === '윤서천' || card.baseName === '도천영') card.stats.atk = Math.floor(card.stats.atk * 1.12); }
                },
                {
                    name: '목숨줄을 붙잡고 계시니까요',
                    description: '독고유진 & 양석민 DEF +20%',
                    condition: (deck) => deck.some(c => c.baseName === '독고유진') && deck.some(c => c.baseName === '양석민'),
                    applyBonus: (card) => { if (card.baseName === '독고유진' || card.baseName === '양석민') card.stats.def = Math.floor(card.stats.def * 1.20); }
                },
                {
                    name: '너무 티나는 짝사랑',
                    description: '박연우 & 강은율 HP/DEF +10%',
                    condition: (deck) => deck.some(c => c.baseName === '박연우') && deck.some(c => c.baseName === '강은율'),
                    applyBonus: (card) => {
                        if (card.baseName === '박연우' || card.baseName === '강은율') {
                            card.stats.hp = Math.floor(card.stats.hp * 1.10);
                            card.stats.def = Math.floor(card.stats.def * 1.10);
                        }
                    }
                }
            ];
			
			// --- 캐릭터 표정 이미지 데이터 ---
            const characterPortraits = {
                '서도진': {
                    neutral: 'https://i.imgur.com/9AoLI6I.png',
                    serious: 'https://i.imgur.com/ERUGX0P.png',
                    surprised: 'https://i.imgur.com/IayOWqf.png',
                    angry: 'https://i.imgur.com/ERUGX0P.png',
                },
                '도천영': {
                    neutral: 'https://i.imgur.com/svV5WKn.png',
                    serious: 'https://i.imgur.com/HlApnIL.png',
                },
                '윤필규': {
                    neutral: 'https://i.imgur.com/x6rfl1m.png'
                },
                '강은율': {
                    neutral: 'https://placehold.co/400x800/0bc5ea/ffffff?text=강은율',
                    serious: 'https://placehold.co/400x800/0987a0/ffffff?text=강은율'
                },
                '박연우': {
                    neutral: 'https://placehold.co/400x800/dd6b20/ffffff?text=박연우'
                },
                '백정문': {
                    neutral: 'https://placehold.co/400x800/f687b3/ffffff?text=백정문',
                    serious: 'https://placehold.co/400x800/d53f8c/ffffff?text=백정문'
                },
                '양석민': {
                    neutral: 'https://placehold.co/400x800/2f855a/ffffff?text=양석민',
                    serious: 'https://placehold.co/400x800/22543d/ffffff?text=양석민'
                },
                '독고유진': {
                    neutral: 'https://placehold.co/400x800/805ad5/ffffff?text=독고유진',
                    serious: 'https://placehold.co/400x800/553c9a/ffffff?text=독고유진'
                },
                '윤서천': {
                    neutral: 'https://i.imgur.com/Ruo7GXd.png',
                    serious: 'https://i.imgur.com/L6RdFz9.png'
                },
                '한 현': {
                    neutral: 'https://i.imgur.com/0F4cRdF.png'
                },
                '윤유준': {
                    neutral: 'https://placehold.co/400x800/c53030/ffffff?text=윤유준',
                    surprised: 'https://placehold.co/400x800/e53e3e/ffffff?text=윤유준'
                },
				'선생': { 
                    neutral: 'https://placehold.co/400x800/8B4513/ffffff?text=선생'
                },
                // 👇 [신규 추가 2]
                '백도화': {
                    neutral: 'https://placehold.co/400x800/FFC0CB/000000?text=백도화'
                }
            };
			
			const rarityProbabilities = { 'SSR': 3, 'SR': 12, 'R': 35, 'N': 50 };
            const eventRarityProbabilities = { 'SSR': 6, 'SR': 14, 'R': 30, 'N': 50 };
            const EVENT_CHARACTER_NAME = '[결혼 반지는 아니지만] 서도진';
            const EVENT_START_DATE = new Date('2025-10-26T00:00:00');
            const EVENT_END_DATE = new Date('2025-11-9T23:59:59');
			// --- 강화(퇴고) 비용 설정 ---

// 레벨 0->1, 1->2, ..., 8->9로 갈 때 필요한 만년필의 기본 비용
// (기존의 ENHANCEMENT_COSTS 배열을 대체합니다)
const ENHANCEMENT_BASE_COSTS = [5, 10, 15, 25, 40, 60, 85, 115, 150];

// 등급별 비용 배율 (N등급이 기준 1.0)
const RARITY_COST_MULTIPLIER = {
    'N': 0.7,   // N등급: 기준 비용의 70% 소모 (가장 저렴)
    'R': 1.0,   // R등급: 기준 비용의 100% 소모 (기준)
    'SR': 1.3,  // SR등급: 기준 비용의 130% 소모
    'SSR': 1.6, // SSR등급: 기준 비용의 160% 소모 (가장 비쌈)
};

// 기존에 있던 ENHANCEMENT_COSTS 또는 enhancementCosts 변수는 삭제하거나 주석 처리해야 합니다.
// (만약 있다면 삭제하세요): const ENHANCEMENT_COSTS = [5, 10, 15, 25, 40, 60, 85, 115, 150];
// (만약 있다면 삭제하세요): const enhancementCosts = [10, 20, 35, 55, 80, 110, 150, 200, 250];

// 나머지 게임 설정 데이터는 그대로 유지합니다.

// ✅ game_data.js 파일 맨 아래에 이 코드를 통째로 추가하세요.

const characterProfiles = {
    '서도진': {
        name: '서도진',
        age: 37,
        job: '추리소설가',
        description: '베스트셀러 추리소설가. 남에게 떠밀려 투고된 글이 공전의 히트를 쳤다. 이런 관심 받고 싶지 않지만, 담당 편집자의 격려로 어찌어찌 글쟁이 생활을 이어나가는 중.',
        imageUrl: 'https://placehold.co/300x500/a0aec0/ffffff?text=서도진+프로필' // 대표 프로필 이미지
    },
    '윤필규': {
        name: '윤필규',
        age: 32,
        job: '편집자',
        description: '서도진의 담당 편집자. 꼼꼼하고 성실한 성격으로, 틈만 나면 슬럼프에 빠지는 서도진과 동거하며 그의 생활을 돕는다. 어디서 나온지 모를 올곧은 정의감을 숨기고 있다.',
        imageUrl: 'https://placehold.co/300x500/63b3ed/ffffff?text=윤필규+프로필'
    },
    '윤서천': {
        name: '윤서천',
        age: 31,
        job: '화학과 대학원생',
        description: '일본에서 박사과정을 밟다가 모종의 사건으로 지도교수를 잃고 귀국한 연구자. 윤필규의 동생이자 도천영의 학생.',
        imageUrl: 'https://placehold.co/300x500/f6e05e/000000?text=윤서천+프로필'
    },
    '한 현': {
        name: '한 현',
        age: 32,
        job: '동네서점 주인',
        description: '동네의 작은 서점을 운영하는 평범한 청년. 눈앞의 사건이 그를 다시 현장으로 이끈다.',
        imageUrl: 'https://placehold.co/300x500/f6e05e/000000?text=한+현+프로필'
    },
    '도천영': {
        name: '도천영',
        age: 42,
        job: '화학과 부교수',
        description: '서울 모 대학교 화학과 소속 부교수. 아직은 열의가 있는 FM. 연구 주제가 마이너해 학생이 별로 오지 않는 게 고민이다.',
        imageUrl: 'https://placehold.co/300x500/086f83/ffffff?text=도천영+프로필'
    },
    '박연우': {
        name: '박연우',
        age: 46,
        job: '화학과 교수',
        description: '서울 모 대학교 화학과 소속 교수. 한때 학계의 혜성으로 소개되었으나 현재는 열의는 커녕 삶의 의지도 영 보이지 않는다. 그녀의 유기화학 연구실은 학생들의 협조로 어찌어찌 돌아가는 중.',
        imageUrl: 'https://placehold.co/300x500/c05621/ffffff?text=박연우+프로필'
    },
    '강은율': {
        name: '강은율',
        age: 36,
        job: '화학과 조교수',
        description: '서울 모 대학교 화학과 소속 조교수. 언제나 미소를 잃지 않는 긍정적인 성격의 연구자. 제일 좋아하는 건 4f 오비탈.',
        imageUrl: 'https://placehold.co/300x500/0987a0/ffffff?text=강은율+프로필'
    },
    '백정문': {
        name: '백정문',
        age: 32,
        job: '수학자',
        description: '서울 모 대학교 수학과 소속 조교수. 부드러운 성격으로 학생들에게 소소하게 인기가 있다. 개인 시간에는 어쩐지 성격이 다르다는 모양이지만...',
        imageUrl: 'https://placehold.co/300x500/d53f8c/ffffff?text=백정문+프로필'
    },
    '독고유진': {
        name: '독고유진',
        age: 39,
        job: '호러소설가',
        description: '소설보다 더 소설 같은 현실의 사건을 해결하는 호러소설가. 아니, 사실 해결은 나 말고 교수님이 하신다고 봐야 하지만. 손 정도는 빌려드리니까 말이야.',
        imageUrl: 'https://placehold.co/300x500/553c9a/ffffff?text=독고유진+프로필'
    },
    '양석민': {
        name: '양석민',
        age: 48,
        job: '민속학과 교수',
        description: '충청 모 대학 민속학과 소속 교수. 세부전공이 무어나고? 종교학이란다. 인간의 종교도 외우주의 종교도 연구하고 있지. 외우주의 종교가 무어냐고? 후후...',
        imageUrl: 'https://placehold.co/300x500/22543d/ffffff?text=양석민+프로필'
    },
    '윤유준': {
        name: '윤유준',
        age: 29,
        job: '약학과 학생',
        description: '충청 모 대학 약학과 소속 학부생. 오컬트를 좋아하기는 하지만 막 믿지는 않았다고요. 재미삼아 괴담 블로그 정도나 자주 봤을 뿐인데, 설마 이렇게 될 거라고는.',
        imageUrl: 'https://placehold.co/300x500/742a2a/ffffff?text=윤유준+프로필'
    },
	'선생': {
        name: '선생',
        age: 42, // (스토리 기반 추정)
        job: '고등학교 수학 교사',
        description: '실패한 도시로 이사 온 고등학교 수학 선생님. 멍한 눈을 하고 있지만, 아이를 키워본 경험에서 나온 날카로운 통찰력으로 사건의 핵심을 꿰뚫는다.',
        imageUrl: 'https://placehold.co/300x500/8B4513/ffffff?text=선생+프로필'
    },
    // 👇 [신규 추가 2]
    '백도화': {
        name: '백도화',
        age: 37, // (스토리 기반 추정)
        job: '인터넷 방송인',
        description: '고양이 귀 헤드셋을 쓴 스트리머. 하지만 그 이면에는 또다른 얼굴이 숨겨져 있는 모양인데. ',
        imageUrl: 'https://placehold.co/300x500/FFC0CB/000000?text=백도화+프로필'
    }
};

const CURRENT_EVENT_ID = "mini_event_202510_dohwa";


const currentEventInfo = {
    title: "[ON] 승급전 세번만", // 이벤트 제목
    startDate: EVENT_START_DATE, // 기존 이벤트 시작 날짜 변수 사용
    endDate: EVENT_END_DATE,     // 기존 이벤트 종료 날짜 변수 사용
    bannerImageUrl: "https://placehold.co/600x200/5a4fcf/ffffff?text=푸른+잉크와+그림자", // 이벤트 홈 배너 이미지
    description: "'실패한 도시'를 떠난 백도화. 몇 달의 시간이 흐른 뒤, 긴 휴식기를 가졌던 그의 방송이 다시 시작된다. 그러나 방송을 보던 현은 무언가 이상한 낌새를 느끼고, 도진에게 의견을 구하는데….", // 이벤트 설명
    gachaCharacterName: EVENT_CHARACTER_NAME // 기존 이벤트 뽑기 캐릭터 이름 변수 사용
};

// game_data.js



// --- 캐릭터 SD 이미지 매핑 (없으면 기본 카드 이미지나 플레이스홀더 사용) ---
// 실제 게임에서는 배경이 투명한 귀여운 SD 캐릭터 이미지가 필요합니다.
const chibiImages = {
    '서도진': 'https://i.imgur.com/2N9aikK.png',
    '윤필규': 'https://i.imgur.com/25130ai.png',
	'한 현': 'https://i.imgur.com/mK2Hbzp.png',
	'윤서천': 'https://i.imgur.com/G28HUhv.png',
	'도천영': 'https://i.imgur.com/smQIEQD.png',
    // ... 나머지 캐릭터들도 추가
};



// 캐릭터 상호작용 대사 데이터
const interactionDialogues = [
    {
        pair: ['서도진', '윤필규'],
        dialogues: [
            ['마감은... 지키고 계시죠?', '아, 지금 하러 가려던 참이야...'],
            ['작가님, 식사는 하셨나요?', '아니, 원고 쓰느라 아직...'],
            ['원고 잊지 않으셨죠?', '으윽... 알았다니까.']
        ]
    },
    {
        pair: ['서도진', '한 현'],
        dialogues: [
            ['그 사건, 좀 이상하지 않아?', '네, 저도 그렇게 생각해요.'],
            ['현아, 서점에 신간 들어왔어?', '작가님 책은 제일 잘 보이는 곳에 뒀어요.']
        ]
    },
    {
        pair: ['윤서천', '도천영'],
        dialogues: [
            ['흥미로운 데이터가 나왔네요.', '그래? 보여줘 봐.'],
            ['이 시약은 위험하지 않아요?', '통제만 잘하면 완벽한 도구지.']
        ]
    },
    // 특정 파트너가 없을 때의 범용 대사 (pair를 null로 처리하거나 별도 로직 사용)
];

// 범용 상호작용 대사 (쌍이 맞지 않을 때 사용)
const genericInteractions = [
    ['오늘 날씨가 좋네요.', '그러게 말입니다.'],
    ['사건 조사는 잘 돼가나요?', '쉽지 않네요.'],
    ['안녕하세요!', '반갑습니다.']
];

























