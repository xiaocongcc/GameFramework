
/**
 * 单例工厂
 */
export class SingletonFactory {

    private static instances: Map<{ new() }, Object> = new Map<{ new() }, Object>();

    public static getInstance<T>(c: { new(): T }): T {
        if (!SingletonFactory.instances.has(c)) {
            let obj = new c();
            SingletonFactory.instances.set(c, obj);
            return obj;
        }
        return <T>SingletonFactory.instances.get(c);
    }
}