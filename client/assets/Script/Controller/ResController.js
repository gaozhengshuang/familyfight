const Tools = require('../Util/Tools');

var ResController = function () {
    this.spriteFrames = {};
}

const HeadSprites = [
    'Image/GameScene/headicon/901',
    'Image/GameScene/headicon/902',
    'Image/GameScene/headicon/903',
    'Image/GameScene/headicon/904',
    'Image/GameScene/headicon/905',
    'Image/GameScene/headicon/906',
    'Image/GameScene/headicon/907',
    'Image/GameScene/headicon/908',
    'Image/GameScene/headicon/909',
    'Image/GameScene/headicon/910',
]

ResController.prototype.Init = function (cb) {
    Tools.InvokeCallback(cb);
};

ResController.prototype.GetSpriteFrameByName = function (name, cb) {
    let spriteFrame = this.spriteFrames[name];
    if (spriteFrame == null) {
        cc.loader.loadRes(name, cc.SpriteFrame, function (err, res) {
            if (err) {
                Tools.InvokeCallback(cb, err);
            } else {
                this.spriteFrames[name] = res;
                Tools.InvokeCallback(cb, null, res);
            }
        }.bind(this));
    } else {
        Tools.InvokeCallback(cb, null, spriteFrame);
    }
};

ResController.prototype.DestoryAllChildren = function (node) {
    if (node && node.children) {
        let children = node.children;
        for (let i = 0; i < children.length; i++) {
            let child = children[i];
            if (child) {
                child.destroy();
            }
        }
        node.removeAllChildren(true);
    }
}

ResController.prototype.SetSprite = function (sprite, path) {
    this.GetSpriteFrameByName(path, function (err, res) {
        if (err) {
            console.log('[严重错误] 奖励资源加载错误 ' + err);
        } else {
            sprite.spriteFrame = res;
        }
    });
}

ResController.prototype.RandomHead = function (cb) {
    this.GetSpriteFrameByName(HeadSprites[Tools.GetRandomInt(0, HeadSprites.length)], cb);
};

module.exports = new ResController();