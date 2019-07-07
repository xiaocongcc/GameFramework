declare namespace wx {
    interface SocketTask {
        send(obj: { data: any }): void;
        close(obj?: any): void;
        onOpen(func?: any): void;
        onClose(func?: any): void;
        onError(func?: any): void;
        onMessage(func?: any): void;
    }

    /**
     * 通用的回调型函数参数
     */
    interface CommonCallbackParam {
        /**
        * 接口调用成功的回调函数
        */
        success?: Function;
        /**
         * 接口调用失败的回调函数
         */
        fail?: Function;
        /**
         * 接口调用结束的回调函数（调用成功、失败都会执行）
         */
        complete?: Function;
    }

    interface SocketParam extends CommonCallbackParam {
        url: string;
        /**
         * HTTP Header，Header 中不能设置 Referer
         */
        header?: Object;
        /**
         * 子协议数组
         */
        protocols?: Array<string>;
    }

    function connectSocket(param: SocketParam): SocketTask;
}
