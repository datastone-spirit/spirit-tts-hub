<!--
 * @Author: mulingyuer
 * @Date: 2025-07-08 11:11:20
 * @LastEditTime: 2025-09-29 17:18:34
 * @LastEditors: mulingyuer
 * @Description: 表格操作组件
 * @FilePath: \frontend\src\components\ZLSpace\index.vue
 * 怎么可能会有bug！！！
-->
<script lang="ts">
import { ElSpace } from "element-plus";
import type { SpaceProps } from "element-plus";
import { Comment } from "vue";

export interface TableOperationsProps {
	size?: SpaceProps["size"];
	spacer?: SpaceProps["spacer"];
}

export default defineComponent({
	name: "TableOperations",
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

		return () =>
			h(
				ElSpace,
				{
					size: props.size,
					spacer: props.spacer
				},
				() => {
					// 剔除v-if
					let filterList = (slots.default?.() || []).filter((node) => node?.type !== Comment);
					//  剔除v-show="false"
					filterList = filterList.filter(({ dirs }) => {
						if (!dirs || !dirs.length) return true;
						// @ts-expect-error fuck ts
						const findShow = dirs.find((item) => item.dir.name === "show");
						if (!findShow) return true;
						return findShow.value;
					});

					return filterList;
				}
			);
	}
});
</script>
