let fs = require('fire-fs');
let packageName = "proto-killer";

module.exports = {
    init() {
        // Editor.log("proto-item 注册组件!");
        Vue.component('proto-item', {
            props: ['data', 'index'],
            template: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/item/protoItem.html', 'utf8')) + "",
            created() {

            },
            methods: {
                onBtnClickUse() {
                    this.data.isUse = !this.data.isUse;
                    // Editor.log("on use: " + this.data.isUse);
                }
            },
            computed: {},
        });
    }
};