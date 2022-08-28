/**
 * 座標を管理するためのクラス
 */
class Position {
    
    constructor(x, y){
        // X 座標
        this.x = x;
        // Y 座標
        this.y = y;
    }

    set(x, y){
        if(x != null){this.x = x;}
        if(y != null){this.y = y;}
    }

    /**
     * 対象の Position クラスのインスタンスとの距離を返す
     * @param {Position} target - 距離を測る対象
     */
    distance(target){
        let x = this.x - target.x;
        let y = this.y - target.y;
        return Math.sqrt(x * x + y * y);
    }
}

/**
 * キャラクター管理のための基幹クラス
 */
class Character {
    /**
     * @constructor
     * @param {CanvasRenderingContext2D} ctx - 描画などに利用する 2D コンテキスト
     * @param {number} x - X 座標
     * @param {number} y - Y 座標
     * @param {number} w - 幅
     * @param {number} h - 高さ
     * @param {number} life - キャラクターのライフ
     * @param {string} imagePath - キャラクター用の画像のパス
     */
    constructor(ctx, x, y, w, h, life, imagePath){
        
        this.ctx = ctx;
        
        this.position = new Position(x, y);
       
        this.width = w;
        
        this.height = h;
        
        this.life = life;
        
        this.ready = false;
        
        this.image = new Image();
        this.image.addEventListener('load', () => {
            // 画像のロードが完了したら準備完了フラグを立てる
            this.ready = true;
        }, false);
        this.image.src = imagePath;
    }
    
    /**
     * キャラクターを描画する
     */
    draw(){
        // キャラクターの幅を考慮してオフセットする量
        let offsetX = this.width / 2;
        let offsetY = this.height / 2;
        // キャラクターの幅やオフセットする量を加味して描画する
        this.ctx.drawImage(
            this.image,
            this.position.x - offsetX,
            this.position.y - offsetY,
            this.width,
            this.height
        );
    }

}

/**
 * player クラス
 */
class Player extends Character {
    /**
     * @constructor
     * @param {CanvasRenderingContext2D} ctx - 描画などに利用する 2D コンテキスト
     * @param {number} x - X 座標
     * @param {number} y - Y 座標
     * @param {number} w - 幅
     * @param {number} h - 高さ
     * @param {Image} image - キャラクター用の画像のパス
     */
    constructor(ctx, x, y, w, h, imagePath){
        // 継承元の初期化
        super(ctx, x, y, w, h, 1, imagePath);

        // 自身の移動スピード（update 一回あたりの移動量）
        this.speed = 3;        
        
        // 占いで使う数字
         this.omikujiNo = null;
    }

    /**
     * キャラクターの状態を更新し描画を行う
     */
    update(){
        
            // キーの押下状態を調べて挙動を変える
            if(window.isKeyDown.key_ArrowLeft === true){
                this.position.x -= this.speed; // アローキーの左
            }
            if(window.isKeyDown.key_ArrowRight === true){
                this.position.x += this.speed; // アローキーの右
            }
            // 移動後の位置が画面外へ出ていないか確認して修正する
            let canvasWidth = this.ctx.canvas.width;
            let canvasHeight = this.ctx.canvas.height;
            let tx = Math.min(Math.max(this.position.x, 0), canvasWidth);
            this.position.x = tx;

        // playerキャラクターを描画する
        this.draw();

        // 念の為グローバルなアルファの状態を元に戻す
        this.ctx.globalAlpha = 1.0;
    }
}

/**
 * おみくじ（花びら）クラス
 */
class Omikuji extends Character {
    /**
     * @constructor
     * @param {CanvasRenderingContext2D} ctx - 描画などに利用する 2D コンテキスト
     * @param {number} x - X 座標
     * @param {number} y - Y 座標
     * @param {number} w - 幅
     * @param {number} h - 高さ
     * @param {Image} image - キャラクター用の画像のパス
     */
    constructor(ctx, x, y, w, h, imagePath){
        // 継承元の初期化
        super(ctx, x, y, w, h, 0, imagePath);
        // 自身が出現してからのフレーム数
        this.frame = 0;
        // 自身と衝突判定を取る対象を格納する
        this.target = null;
        // 占いで使う数字を花びらごとに付与する
        this.omikujiNo = null;            
    }

    /**
     * おみくじを配置する
     * @param {number} x - 配置する X 座標
     * @param {number} y - 配置する Y 座標
     * @param {number} [life=1] - 設定するライフ
     */

     set(x, y){
        // おみくじの初期位置
        this.position.set(x, y);
        // おみくじのライフを 0 より大きい値に設定する
        this.life = 1;
        // おみくじのフレームをリセットする
        this.frame = 0;
    }
    
    /**
     * キャラクターの状態を更新し描画を行う
     */
    update(){
        // おみくじのライフが 0 以下の場合はなにもしない
        if(this.life <= 0){return;}

        // X 座標はサイン波で、Y 座標は一定量で変化する
        this.position.x += Math.sin(this.frame / 30);
        this.position.y += 0.6;
        // 画面外（画面下端）へ移動していたらライフを 0（非生存の状態）に設定する
        if(this.position.y - this.height > this.ctx.canvas.height){
            this.life = 0;
        }

        // playerと対象との衝突判定を行う        
        let v = this.target;
            // 自身か対象のライフが 0 以下の対象は無視する            
            if(this.life <= 0 || v.life <= 0){return;}
            // 自身の位置と対象との距離を測る
            let dist = this.position.distance(v.position);
            // 自身と対象の幅の 1/4 の距離まで近づいている場合衝突とみなす
            if(dist <= (this.width + v.width) / 4){
                // 自身のライフを 0 にする
                this.life = 0;
                v.life = 0;
                v.omikujiNo = this.omikujiNo;
                v.endTime = Date.now();
            };
        // 描画を行う
        this.draw();
        // おみくじのフレームをインクリメントする
        ++this.frame;
    }    
}