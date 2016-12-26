type Constructor = new () => any;

export class PropOptions {
    static required(type?: Constructor | Constructor[], validator?: (value: any) => boolean) {
        return { required: true, type, validator };
    }
    static stringRequired(validator?: (value: string) => boolean) {
        return { required: true, type: String, validator };
    }
    static numberRequired(validator?: (value: number) => boolean) {
        return { required: true, type: Number, validator };
    }
    static booleanRequired(validator?: (value: boolean) => boolean) {
        return { required: true, type: Boolean, validator };
    }
    static objectRequired(validator?: (value: {}) => boolean) {
        return { required: true, type: Object, validator };
    }
    static arrayRequired(validator?: (value: any[]) => boolean) {
        return { required: true, type: Array, validator };
    }

    static default_(value: any, type?: Constructor | Constructor[], validator?: (value: any) => boolean) {
        return { default: value, type, validator };
    }
    static stringDefault(value: string, validator?: (value: string) => boolean) {
        return { default: value, type: String, validator };
    }
    static numberDefault(value: number, validator?: (value: number) => boolean) {
        return { default: value, type: Number, validator };
    }
    static booleanDefault(value: boolean, validator?: (value: boolean) => boolean) {
        return { default: value, type: Boolean, validator };
    }
    static objectDefault(factory: () => {}, validator?: (value: {}) => boolean) {
        return { default: factory, type: Object, validator };
    }
    static arrayDefault(factory: () => any[], validator?: (value: any[]) => boolean) {
        return { default: factory, type: Array, validator };
    }
}
