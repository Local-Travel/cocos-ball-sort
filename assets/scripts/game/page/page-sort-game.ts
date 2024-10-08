import { _decorator, Component, EventTouch, Input, input, Label, Node, ProgressBar, resources, Sprite, SpriteFrame } from 'cc';
import { Constants } from '../../utils/const';
import { User } from '../../data/user';
const { ccclass, property } = _decorator;

@ccclass('PageSortGame')
export class PageSortGame extends Component {
    // 顶部
    @property(Node)
    timeNode: Node = null;
    @property(Node)
    shopNode: Node = null;
    @property(Node)
    resetNode: Node = null;
    @property(Node)
    soundRoot: Node = null
    @property(Node)
    pageShopRoot: Node = null

    // 底部
    @property(Node)
    btnWithdrawNode: Node = null;
    @property(Node)
    btnAddTubeNode: Node = null;
    @property(Node)
    btnAddTimeNode: Node = null;

    private _isSupportSound: boolean = true
    private _user: User = null
    private _time: number = 0;
    private _dataTime: number = 0;

    start() {

    }

    protected onEnable(): void {
        this.soundRoot.on(Node.EventType.TOUCH_END, this.onSound, this)
        this.shopNode.on(Node.EventType.TOUCH_END, this.onShop, this)
        this.resetNode.on(Node.EventType.TOUCH_END, this.onReset, this)

        this.btnWithdrawNode.on(Node.EventType.TOUCH_END, this.onWithdraw, this)
        this.btnAddTubeNode.on(Node.EventType.TOUCH_END, this.onAddTube, this)
        this.btnAddTimeNode.on(Node.EventType.TOUCH_END, this.onAddTimeClick, this)
    }

    protected onDisable(): void {
        this.soundRoot.off(Node.EventType.TOUCH_END, this.onSound, this)
        this.shopNode.off(Node.EventType.TOUCH_END, this.onShop, this)
        this.resetNode.off(Node.EventType.TOUCH_END, this.onReset, this)

        this.btnWithdrawNode.off(Node.EventType.TOUCH_END, this.onWithdraw, this)
        this.btnAddTubeNode.off(Node.EventType.TOUCH_END, this.onAddTube, this)
        this.btnAddTimeNode.off(Node.EventType.TOUCH_END, this.onAddTimeClick, this)
    }

    update(deltaTime: number) {
        
    }

    protected onDestroy(): void {
        // 移除监听
        this.unschedule(this.setTimeClock);
    }

    init(limitTime: number) {
        const user = User.instance()
        this._user = user
        // 更新用户金币
        console.log('init', limitTime);
        this._time = limitTime;
        this._dataTime = limitTime;
        this.unschedule(this.setTimeClock);
        this.schedule(this.setTimeClock, 1);
    }

    // 重置
    onReset() {
        Constants.sortGameManager.init()
    }

    // 声音
    onSound() {
        this._isSupportSound = !this._isSupportSound
        let url = 'texture/sound';
        url += this._isSupportSound ? '/icon-sound-enabled' : '/icon-sound-disable'
        url += '/spriteFrame'
        // console.log('url', url)

        if (this._isSupportSound) {
            // 音乐打开
            Constants.audioManager.onSound()
            // Constants.audioManager.playBgm()
        } else {
            // 音乐关闭
            Constants.audioManager.offSound()
            // Constants.audioManager.stopBgm()
        }
        resources.load(url, SpriteFrame, (err, spriteFrame) => {
            // console.log(err, spriteFrame)
            if (spriteFrame) {
                const sprite = this.soundRoot.getChildByName('icon').getComponent(Sprite)
                if (sprite) {
                    sprite.spriteFrame = spriteFrame;
                }
            }
        })
    }

    // 回退
    onWithdraw() {
        if (this._user.getWithdrawNum() < 1) {
            return this.onShop()
        }
        Constants.sortGameManager.returnBackLastStep(() => {
            console.log('回退成功')
            this._user.setWithdrawNum(this._user.getWithdrawNum() - 1)
        })
    }

    // 加管 
    onAddTube() {
        if (this._user.getAddTubeNum() < 1) {
            return this.onShop()
        }
        Constants.sortGameManager.addEmptyTube(() => {
            console.log('加管成功')
            this._user.setAddTubeNum(this._user.getAddTubeNum() - 1)
        })
    }

    // 加时
    onAddTimeClick() {
        if (this._user.getAddTimeNum() < 1) {
            return this.onShop()
        }
        this._user.setAddTimeNum(this._user.getAddTimeNum() - 1)
        // console.log('onAddTimeClick');
        // Constant.dialogManager.showTipLabel('功能开发中...');
        this._time += this._dataTime;
    }

    // 商店
    onShop() {
        this.pageShopRoot.active = true
    }

    showTimeClock(time: number) {
        const m = Math.floor(time / 60);
        const s = time % 60;
        const mStr = `${m < 10 ? `0${m}` : m}`;
        const sStr = `${s < 10 ? `0${s}` : s}`;
        const timeStr = `${mStr}:${sStr}`;
        // 设置倒计时
        this.timeNode.getComponent(Label).string = `${timeStr}`;
    }

    setTimeClock() {
        this._time--;
        if (this._time <= 0) {
            this.unschedule(this.setTimeClock);

            console.log('游戏超时');
            // Constant.dialogManager.showTipLabel('游戏超时', () => {
            //     Constant.gameManager.gameOver();
            // });
            Constants.sortGameManager.gameOver(Constants.GAME_FINISH_TYPE.TIME_OUT);
        } else {
            this.showTimeClock(this._time);
        }
    }

}

