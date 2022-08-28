(() => {
    /**
     * キーの押下状態を調べるためのオブジェクト
     * このオブジェクトはプロジェクトのどこからでも参照できるように
     * window オブジェクトのカスタムプロパティとして設定する
     * @global
     * @type {object}
     */
    window.isKeyDown = {};

    // canvas の幅
    const CANVAS_WIDTH = 640;
    // canvas の高さ
    const CANVAS_HEIGHT = 480;
    // 花びらのインスタンス数
    const OMIKUJI_MAX_NUM = 10;

    /**
     * Canvas2D API をラップしたユーティリティクラス
     * @type {Canvas2DUtility}
     */
    let util = null;
    /**
     * 描画対象となる Canvas Element
     * @type {HTMLCanvasElement}
     */
    let canvas = null;
    /**
     * Canvas2D API のコンテキスト
     * @type {CanvasRenderingContext2D}
     */
    let ctx = null;

    let textframe = 0;
    let playTime = 0;
    
    /**
     * 実行開始時のタイムスタンプ
     * @type {number}
     */
    let startTime = null;
    // playerのインスタンス
    let player = null;
    // 花びら（おみくじ）のインスタンスを格納する配列
    let omikujiArray = [];

    /**
     * ページのロードが完了したときに発火する load イベント
     */
    window.addEventListener('load', () => {
        // ユーティリティクラスを初期化
        util = new Canvas2DUtility(document.body.querySelector('#main_canvas'));
        // ユーティリティクラスから canvas を取得
        canvas = util.canvas;
        // ユーティリティクラスから 2d コンテキストを取得
        ctx = util.context;

        // 初期化処理を行う
        initialize();
        // インスタンスの状態を確認する
        loadCheck();
    }, false);

    /**
     * canvas やコンテキストを初期化する
     */
    function initialize() {
        
        let i;
        // canvas の大きさを設定
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        
        // ブラウザの前の画面から引き継いだ変数を使うが　文字列⇒数値変換が必要
        let etoNo = parseInt(FORM["etoNo"]);
        // 戻るボタンで前の画面を表示させたときに　playerのキャラクターを表示させるための数字を送る
        let sendBack  = document.getElementsByName("year");
        sendBack[0].value = etoNo + 12;

        // 画像のパスを変数に入れる
        const p = etoAnimal(etoNo);
        const picPath = p[1];
        // 干支キャラクターを初期化する
        player = new Player(ctx, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 64, 64, 64, picPath);

        // 花びら（おみくじ）を初期化する
        for (i = 0; i < OMIKUJI_MAX_NUM; ++i) {
            const r = generateRandomInt(10);
            if (i % 10 === r) {
                omikujiArray[i] = new Omikuji(ctx, 0, 0, 48, 48, './image/hamster_sleeping_golden.png');
            }
            else {
                omikujiArray[i] = new Omikuji(ctx, 0, 0, 48, 48, './image/sakura.png');
            }
        }
        
        for (i = 0; i < OMIKUJI_MAX_NUM; ++i) {
            // 衝突判定する相手をセットする
            omikujiArray[i].target = player;
            // おみくじの番号をセットする(0-50 幸運度算出に使用する)  
            const omiNo = Math.floor(Math.random()*51);
            omikujiArray[i].omikujiNo = omiNo;
        }
    }
    /**
     * インスタンスの準備が完了しているか確認する
     */
    function loadCheck() {
        // 準備完了を意味する真偽値
        let ready = true;
        // AND 演算で準備完了しているかチェックする
        ready = ready && player.ready;
        // 花びらの準備状況も確認する
        omikujiArray.map((j) => {
            ready = ready && j.ready;
        });
        // 全ての準備が完了したら次の処理に進む
        if (ready === true) {
            // Keyが押されたことを判断する
            keyEvent();
            // 実行開始時のタイムスタンプを取得する
            startTime = Date.now();
            // うらないを検索するインデックスをずらす変数
            today = new Date();
            this_day = today.getDate();
            
            // 描画処理
            render();
        } else {
            // 準備が完了していない場合は 0.1 秒ごとに再帰呼出しする
            setTimeout(loadCheck, 100);
        }
    }

    function keyEvent() {
        // キーの押下時に呼び出されるイベントリスナーを設定する
        window.addEventListener('keydown', (event) => {
            // キーの押下状態を管理するオブジェクトに押下されたことを設定する
            isKeyDown[`key_${event.key}`] = true;
        }, false);
        // キーが離された時に呼び出されるイベントリスナーを設定する
        window.addEventListener('keyup', (event) => {
            // キーが離されたことを設定する
            isKeyDown[`key_${event.key}`] = false;
        }, false);
    }    

    /**
     * 描画処理を行う
     */
    function render() {
        // グローバルなアルファを必ず 1.0 で描画処理を開始する
        ctx.globalAlpha = 1.0;
        // 描画前に画面全体を不透明な明るいグレーで塗りつぶす
        util.drawRect(0, 0, canvas.width, canvas.height, '#eeeeee');

        // スコアの表示
        ctx.font = 'bold 24px monospace';
        util.drawText("アイテムを拾ってね", 30, 50, '#111111');
        const flower = generateRandomInt(100);
        if (flower % 50 === 0) {
            // ライフが 0 の状態の花びらが見つかったら配置する
            for (let i = 0; i < OMIKUJI_MAX_NUM; ++i) {
                if (omikujiArray[i].life <= 0) {
                    let e = omikujiArray[i];
                    e.set(CANVAS_WIDTH * Math.random(), -e.height, 2);  //ここ直す
                    break;
                }
            }
        }
        
        // おみくじを選んだら(life = 0) 結果を表示

        if (player.life <= 0) {
            ++textframe;
            // 結果文字の幅は画面の幅の0.8倍を最大の幅とする
            let textWidth = CANVAS_WIDTH * 0.8 ;
            // 文字の幅を全体の幅に足し、ループする幅を決める
            let loopWidth = CANVAS_WIDTH + textWidth;
            // フレーム数に対する除算の剰余を計算し、文字列の位置とする(文字列を横に流している部分)
            let x = CANVAS_WIDTH - (textframe * 2);
            x = Math.max(x, 50); 

            // 選んだおみくじに対する結果表示
            let luckyrate = 100 - player.omikujiNo;

            playTime = (player.endTime - startTime) / 1000;  // 秒
            let luck = playTime + player.omikujiNo;
            
            switch (true) {
                case luck < 25:
                    index = 0;
                    break;
                case luck < 50:
                    index = 1;
                    break;
                case luck < 75:
                    index = 2;
                    break;     
                default:
                    index = 3;
                    break;                
            }

            ctx.font = 'bold 72px sans-serif';

            /**  おみくじ結果のメッセージ を表示する
             * 
             * playerのキャラクターごとに違う2次元配列を検索する
             * 次元１：同じ日であれば同じ配列を検索する(結果がばらつかない)が違う日であれば別の配列を検索する
             * 次元２：おみくじを引くまでの時間と引いたおみくじの結果で検索結果を変える             * 
             */

            // ブラウザの前の画面から引き継いだ変数を使うが　文字列⇒数値変換が必要
            const etoNo = parseInt(FORM["etoNo"]);
            const a = etoAnimal(etoNo);
            const ani = a[0];

            // なにをうらなうか
            const item = FORM["item"]; // 文字列のまま            
            let itemsel = "";

            switch (item) {
                case "place":
                    itemsel = luckyPlace((etoNo + this_day) % 12, index);
                    break;
                case "onigiri":
                    itemsel = luckyOnigiri((etoNo + this_day) % 12, index);
                    break;
                case "sushi":
                    itemsel = luckySushi((etoNo + this_day) % 12, index);
                    break;
                case "study":
                    itemsel = luckyStudy((etoNo + this_day) % 12, index);
                    break;
                default:
                    console.log("etoNoで上手く場合分けできていない");
                    break;
            }

            util.drawText(`${itemsel}(ラッキー度${luckyrate} ％)です`, x, CANVAS_HEIGHT / 2, '#ff0000', textWidth);
        }
        else {         
        }

        // playerの状態を更新する
        player.update();

        // 花びら（おみくじ）の状態を更新する
        omikujiArray.map((v) => {
            v.update();
        });

        // 恒常ループのために描画処理を再帰呼出しする
        requestAnimationFrame(render);
    }

    /**
     * 特定の範囲におけるランダムな整数の値を生成する
     * @param {number} range - 乱数を生成する範囲（0 以上 ～ range 未満）
     */
    function generateRandomInt(range) {
        let random = Math.random();
        return Math.floor(random * range);
    }

    function etoAnimal(etoNo) {
        let etoAnimal = "";
        let animalPicture = "";
        switch (etoNo) {
            case 0:
                etoAnimal = "申";
                animalPicture = "./image/saru.png";
                break;
            case 1:
                etoAnimal = "酉";
                animalPicture = "./image/tori.png";
                break;
            case 2:
                etoAnimal = "戌";
                animalPicture = "./image/inu.png";
                break;
            case 3:
                etoAnimal = "亥";
                animalPicture = "./image/i.png";
                break;
            case 4:
                etoAnimal = "子";
                animalPicture = "./image/ne.png";
                break;
            case 5:
                etoAnimal = "丑";
                animalPicture = "./image/ushi.png";
                break;
            case 6:
                etoAnimal = "寅";
                animalPicture = "./image/tora.png";
                break;
            case 7:
                etoAnimal = "卯";
                animalPicture = "./image/u.png";
                break;
            case 8:
                etoAnimal = "辰";
                animalPicture = "./image/tatsu.png";
                break;
            case 9:
                etoAnimal = "巳";
                animalPicture = "./image/mi.png";
                break;
            case 10:
                etoAnimal = "午";
                animalPicture = "./image/uma.png";
                break;
            case 11:
                etoAnimal = "未";
                animalPicture = "./image/hitsuji.png";
                break;
            default:
                console.log("etoNoで上手く場合分けできていない");
                break;
        }
        return [etoAnimal, animalPicture];
    }

    function luckyPlace(m, n) {

        const placeArray = [
            ['温泉', '図書館', 'スポーツ観戦', '家'],  ['家', 'ショッピング', 'スポーツ観戦', '友達の家'],  ['家', 'ショッピング', '道の駅', 'スポーツジム'], 
            ['家', 'ショッピング', 'スポーツ観戦', '家'],  ['公園', 'ショッピング', 'スポーツ観戦', '家'],  ['温泉', 'ショッピング', '公園', '家'], 
            ['温泉', 'ショッピング', '友達の家', '公園'],  ['温泉', '家', '図書館', '道の駅'],  ['温泉', '道の駅', 'スポーツ観戦', '家'], 
            ['図書館', 'ショッピング', 'スポーツ観戦', '家'],  ['図書館', 'ショッピング', 'スポーツ観戦', '友達の家'],  ['温泉', '家', 'スポーツ観戦', '家'] 
        ]
        const luckyPlace = `今日のラッキースポットは ${placeArray[m][n]}`;

            return luckyPlace;
        }
        function luckyOnigiri(m, n) {

            const onigiriArray = [
                ['しゃけ', '梅干し', 'おかか', 'しゃけ'], ['おかか', '高菜漬け', 'たらこ', '昆布つくだ煮'], ['いくら', 'おかか', 'しお', '煮たまご'],
                ['ツナマヨ', 'たらこ', 'カルビ', 'おかか'], ['たらこ', '高菜漬け', 'おかか', 'ネギトロ'], ['梅干し', '昆布つくだ煮', 'ツナマヨ', 'たらこ'],  
                ['しお', 'おかか', '梅干し', 'ツナマヨ'], ['ツナマヨ', 'ネギトロ', '梅干し', 'うなぎ'], ['高菜漬け', 'ネギトロ', 'たらこ', 'おかか'],
                ['辛子明太子', 'すじこ', 'カルビ', 'ツナマヨ'], ['昆布つくだ煮', '梅干し', 'しらす', 'いくら'], ['エビマヨ', 'しゃけ', '梅干し', 'しお']
            ]
            const luckyOnigiri = `今日のラッキーおにぎりは ${onigiriArray[m][n]}`;
                return luckyOnigiri;
            }
        function luckySushi(m, n) {

            const sushiArray = [
                ['まぐろ', '赤貝', 'いわし', 'ホッキ貝'], ['サーモン', 'かっぱ', '大トロ', 'まぐろ'], ['ヒラメ', '中とろ', 'かんぴょう', 'シャコ'],
                ['卵焼き', 'こはだ', 'えんがわ', 'ぶり'], ['いくら', 'しめさば', '大トロ', 'ヒラメ'], ['いわし', 'ほたて', 'いくら', '大トロ'],  
                ['しめさば', 'あおやぎ', '中トロ', 'えんがわ'], ['えび', 'いわし', 'かんぱち', '大トロ'], ['まぐろ', 'あじ', '卵焼き', 'ヒラメ'],
                ['あじ', 'シャコ', 'はまぐり', '中トロ'], ['いくら', 'うに', 'シャコ', '赤貝'], ['エビマヨ', 'かんぴょう', 'ぶり', '卵焼き']
            ]
            const luckySushi = `今日のラッキー寿司ネタは ${sushiArray[m][n]}`;
                return luckySushi;
            }
        function luckyStudy(m, n) {

            const studyArray = [
                ['英語', '数学', 'プログラミング', '物理'], ['国語', '英語', '数学', 'プログラミング'], ['プログラミング', '化学', '英語', '数学'],
                ['古文', 'プログラミング', '化学', '英語'], ['物理', '地理', 'プログラミング', '日本史'], ['英語', 'プログラミング', '国語', 'プログラミング'],  
                ['プログラミング', '化学', '地理', '英語'], ['プログラミング', '英語', '世界史', '古文'], ['英語', '日本史', 'プログラミング', '国語'],
                ['地理', '数学', 'プログラミング', '日本史'], ['プログラミング', '国語', '数学', '化学'], ['英語', '古文', 'プログラミング', 'プログラミング']
            ]
            const luckyStudy = `今日のラッキー教科は ${studyArray[m][n]}`;
                return luckyStudy;
            }    
})();