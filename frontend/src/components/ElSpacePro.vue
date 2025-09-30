<!--
 * @Author: mulingyuer
 * @Date: 2025-07-08 11:11:20
 * @LastEditTime: 2025-09-30 10:33:49
 * @LastEditors: mulingyuer
 * @Description: 增强版ElSpace组件
 * @FilePath: \frontend\src\components\ZLSpace\index.vue
 * 怎么可能会有bug！！！
-->
<script lang="ts">
import { ElSpace } from "element-plus";
import type { SpaceProps } from "element-plus";
import { Comment, type VNode } from "vue";

export interface ElSpaceProProps {
	size?: SpaceProps["size"];
	spacer?: SpaceProps["spacer"];
}

export default defineComponent({
	name: "ElSpacePro",
	props: {
		size: {
			type: [Number, String] as PropType<SpaceProps["size"]>,
			default: "small"
		},
		spacer: {
			type: [String, Object] as PropType<SpaceProps["spacer"]>
		}
	},
	setup(props) {
		const slots = useSlots();

		/** 判断是不是Comment节点
		 * 当`v-if="false"`时默认会插入一个注释节点Comment
		 */
		function isComment(node: VNode): boolean {
			return node?.type === Comment;
		}

		/** 判断是不是v-show指令 */
		function isVShowDirective(dir: DirectiveBinding): boolean {
			// @ts-expect-error fuck ts
			return typeof dir.dir.name === "string" && dir.dir.name === "show";
		}

		return () =>
			h(
				ElSpace,
				{
					size: props.size,
					spacer: props.spacer
				},
				() => {
					return (slots.default?.() || []).filter((node) => {
						// 剔除 v-if="false" (Comment 节点)
						if (isComment(node)) return false;

						// 检查 v-show="false"
						if (node.dirs && node.dirs.length) {
							const findShow = node.dirs.find(isVShowDirective);
							if (findShow) return Boolean(findShow.value);
						}

						// 既不是 v-if=false 也不是 v-show=false
						return true;
					});
				}
			);
	}
});
</script>
