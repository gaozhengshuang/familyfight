const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
       maxMaid: { default: 0},
    },

    onEnable() {
        this.updateView();
    },

    updateView() {
        let passMaids = Game.MaidModel.GetMaidsByPass(Game.MaidModel.GetTopPass());
        for(let i = 0; i < this.maxMaid; i ++) {
            let node_maid = Game.ViewController.seekChildByName(this.node, "node_maid0"+(i+1));
            if (node_maid) {
                node_maid.active = i < passMaids.length;
                if (i < passMaids.length) {
                    let label_name = node_maid.getChildByName("label_name").getComponent(cc.Label);
                    let label_next = node_maid.getChildByName("label_next").getComponent(cc.Label);
                    let image_maid = node_maid.getChildByName("image_maid").getComponent(cc.Sprite);

                    label_name.string = passMaids[i].Name;
                    label_next.node.active = (i == (passMaids.length-1));
                    Game.ResController.SetSprite(image_maid, passMaids[i].Path);

                    let madiInfo = Game._.find(Game.MaidModel.GetMaids(), {id: passMaids[i].Id});
                    if (madiInfo) {
                        image_maid.node.color = cc.color(255, 255, 255, 255);
                    } else {
                        image_maid.node.color = cc.color(0, 0, 0, 160);
                    }
                }
            }            
        }
    },
});
