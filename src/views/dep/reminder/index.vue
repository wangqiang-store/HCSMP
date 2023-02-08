<template>
  <el-row class="container">
    <el-col
      :span="24"
      class="d_flex d_flex_c"
    >
      <el-image
        :src="require('@/assets/image/u84.png')"
        style="width:600px"
      ></el-image>
    </el-col>
    <el-col :span="24">
      <p
        class="tac"
        style="font-size:30px;color:#adadad"
      >页面升级中...</p>
    </el-col>
  </el-row>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({

})
</script>

<style>
</style>