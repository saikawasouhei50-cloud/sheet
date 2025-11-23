// --- 게임 설정 ---
            let characters = [];
let monsters = {}; // 몬스터는 객체({}) 형태입니다!
let furnitureItems = [];
let eventDungeons = [];
let eventShopItems = [];
let mainStories = [];  // 추가
let eventStories = []; // 추가
			// ==========================================
// 1. 아까 복사한 웹 앱 URL을 따옴표 안에 넣으세요
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbyPcE7lXAIcoyrUR3PbQNbDvSxUNjxe2jAKoKxCXzNpQNdqLOufffh1K-p1mPiiiSixcA/exec";
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

		// 6. 메인 스토리 조립 (챕터별로 묶기)
        const rawMainStories = data.mainStories;
        mainStories = [];
        let currentMainChapter = null;
        let currentMainChapterId = -1;

        rawMainStories.forEach(row => {
            const chapterId = Number(row.chapter_id);
            
            // 새로운 챕터가 시작되면 챕터 객체를 만듭니다
            if (chapterId !== currentMainChapterId) {
                currentMainChapterId = chapterId;
                currentMainChapter = {
                    title: row.title,
                    dungeonToUnlock: (row.dungeonToUnlock && row.dungeonToUnlock !== "") ? row.dungeonToUnlock : null,
                    content: []
                };
                mainStories.push(currentMainChapter);
            }
            
            // 대사를 챕터의 content 배열에 추가합니다
            currentMainChapter.content.push({
                character: (row.character && row.character !== "") ? row.character : null,
                expression: row.expression,
                position: row.position,
                dialogue: row.dialogue
            });
        });

        // 7. 이벤트 스토리 조립 (방식은 메인 스토리와 동일)
        const rawEventStories = data.eventStories;
        eventStories = [];
        let currentEventChapter = null;
        let currentEventChapterId = -1;

        rawEventStories.forEach(row => {
            const chapterId = Number(row.chapter_id);
            
            if (chapterId !== currentEventChapterId) {
                currentEventChapterId = chapterId;
                currentEventChapter = {
                    title: row.title,
                    content: []
                };
                eventStories.push(currentEventChapter);
            }
            
            currentEventChapter.content.push({
                character: (row.character && row.character !== "") ? row.character : null,
                expression: row.expression,
                position: row.position,
                dialogue: row.dialogue
            });
        });

        console.log("스토리 데이터 로딩 완료!");

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



























