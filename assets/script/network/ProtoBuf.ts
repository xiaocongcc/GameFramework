export default class ProtoBuf {
	protobufjs;

	constructor() {
		this.protobufjs = require('protobufjs');
		// this.protobufjs.Util.IS_NODE = cc.sys.isNative;

		let self = this;

		// 此方法是将ProtoBuf.Util.fetch函数替换成cc.loader.loadRes函数，以解决在微信小游戏中不能使用XHR的问题
		this.protobufjs.loadProtoFile = function (filename, callback, builder) {
			if (callback && typeof callback === 'object') {
				builder = callback,
					callback = null;
			} else if (!callback || typeof callback !== 'function') {
				callback = null;
			}
			if (callback) {
				return cc.loader.loadRes(typeof filename === 'string' ? filename : filename["root"] + "/" + filename["file"], function (error, contents) {
					if (contents === null) {
						callback(Error("Failed to fetch file"));
						return;
					}
					try {
						callback(error, self.protobufjs.loadProto(contents, builder, filename));
					} catch (e) {
						callback(e);
					}
				});
			}
			var contents = cc.loader.loadRes(typeof filename === 'object' ? filename["root"] + "/" + filename["file"] : filename);
			return contents === null ? null : self.protobufjs.loadProto(contents, builder, filename);
		};

		// 解决在一个proto文件import另一个proto文件的问题，前提得这个proto文件import过的
		this.protobufjs.Util.fetch = cc.loader.getRes.bind(cc.loader);
	}

	/**
	 * 动态加载proto file
	 * @param filePath proto文件名，不需要带后缀，一定要放在assets/resources目录下
	 * @param doFunc 加载完文件的回调，在此函数里面处理message的封装和解析
	 */
	loadFile(filePath: string, doFunc: Function): any {
		let newBuilder = this.protobufjs.newBuilder();

		this.protobufjs.loadProtoFile(filePath, (error, builder) => {
			if (error) {
				console.error('ProtoBuf loadFile error, msg = ' + error);
				doFunc(null, error);
				return;
			}
			console.log(`loadFile ${filePath} success!`);
			if (typeof doFunc == 'function') {
				doFunc(builder, null);
			}
		}, newBuilder);
	}
}