import { type PropType } from "vue";
declare const _default: import("vue").DefineComponent<{
    contexts: {
        type: PropType<string[]>;
        required: true;
        default: () => never[];
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    addContext: (val: string) => void;
}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    contexts: {
        type: PropType<string[]>;
        required: true;
        default: () => never[];
    };
}>> & {
    onAddContext?: ((val: string) => any) | undefined;
}, {
    contexts: string[];
}, {}>;
export default _default;
//# sourceMappingURL=Contexts.vue.d.ts.map