<template>
  <el-row>
    <el-col :span="24">
      <el-card>
        <template #header>
          <div class="header w-100">
            <slot name="header">
              <h3 class="ml-20 text-ellipsis">{{title}}</h3>
            </slot>
          </div>
        </template>
        <div class="body">
          <slot name="body"></slot>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template> 
<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue';
export default defineComponent({
  props: {
    title: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    let DATA = reactive({});
    let METHODS = reactive({});
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
    };
  },
});
</script>
<style scoped lang="scss">
/deep/ .el-card__header {
  padding: 0;
}
.header {
  height: 50px;
  line-height: 50px;
  // background-color: #f7d77a;
  background-color: $themeColor;
  color: $textColor;
}
</style>