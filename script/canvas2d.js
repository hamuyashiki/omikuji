/**
 * Canvas2D API をラップしたユーティリティクラス
 */
class Canvas2DUtility {
    /**
     * @constructor
     * @param {HTMLCanvasElement} canvas - 対象となる canvas element
     */
    constructor(canvas){
        /**
         * @type {HTMLCanvasElement}
         */
        this.canvasElement = canvas;
        /**
         * @type {CanvasRenderingContext2D}
         */
        this.context2d = canvas.getContext('2d');
    }

    /**
     * @return {HTMLCanvasElement}
     */
    get canvas(){return this.canvasElement;}
    /**
     * @return {CanvasRenderingContext2D}
     */
    get context(){return this.context2d;}

    /**
     * 矩形を描画する
     * @param {number} x - 塗りつぶす矩形の左上角の X 座標
     * @param {number} y - 塗りつぶす矩形の左上角の Y 座標
     * @param {number} width - 塗りつぶす矩形の横幅
     * @param {number} height - 塗りつぶす矩形の高さ
     * @param {string} [color] - 矩形を塗りつぶす際の色
     */
    drawRect(x, y, width, height, color){
        // 色が指定されている場合はスタイルを設定する
        if(color != null){
            this.context2d.fillStyle = color;
        }
        this.context2d.fillRect(x, y, width, height);
    }
    
    /**
     * テキストを描画する
     * @param {string} text - 描画するテキスト
     * @param {number} x - テキストを描画する位置の X 座標
     * @param {number} y - テキストを描画する位置の Y 座標
     * @param {string} [color] - テキストを描画する際の色
     * @param {number} [width] - テキストを描画する幅に上限を設定する際の上限値
     */
    drawText(text, x, y, color, width){
        // 色が指定されている場合はスタイルを設定する
        if(color != null){
            this.context2d.fillStyle = color;
        }
        this.context2d.fillText(text, x, y, width);
    }
}