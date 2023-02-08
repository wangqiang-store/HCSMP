<template>
  <el-row>
    <el-col :span="24">
      <el-card
        class="box-card mb-10"
        v-for="item of notes"
        :key="item.id"
      >
        <template #header>
          <div
            style="width:100%"
            class="d_flex d_flex_sb"
          >
            <span>创建时间{{ `:${filterTime(item.createTime)}` }}</span>
            <div>
              <el-button
                type="text"
                class="mr-10"
                @click="handleEdit(item)"
              >编辑</el-button>
              <el-button
                type="text"
                @click="handleRemove(item)"
              >删除</el-button>
            </div>
          </div>
        </template>
        <span>{{item.content}}</span>
      </el-card>
      <div
        class="mt-10"
        style="text-align:right"
      >
        <el-button @click="handleCreateRotes">添加新备注</el-button>
      </div>
      <!-- 档案备注模态框 -->
      <el-dialog
        title="档案信息备注"
        v-model="notesDialogVisible"
        width="50%"
      >
        <el-card class="box-card">
          <el-input
            type="textarea"
            v-model="notesParams.content"
          ></el-input>
          <div
            class="mt-10"
            style="text-align:right"
          >
            <el-button
              type="primary"
              @click="handleSave"
            >
              保存
            </el-button>
          </div>
        </el-card>
      </el-dialog>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import { RES_SUCCESS } from '@/api/common/common';
import {
  createNotes,
  deleteNotes,
  getNotes,
  updateNotes,
} from '@/api/ent/noncoalmine';
import { filterTime } from '@/utils/filtration';
import { ElMessage } from 'element-plus';
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  watch,
} from 'vue';
export default defineComponent({
  props: {
    id: {
      type: Number,
      default: [],
    },
  },
  emits: ['handleSave'],
  setup(props, { emit }) {
    const { proxy }: any = getCurrentInstance();
    let DATA: any = reactive({
      notes: [],
      notesDialogVisible: false,
      notesParams: {
        companyId: '',
        content: '',
      },
      id: '',
      dialogType: false,
    });
    let METHODS: any = reactive({
      handleGetNotes: async (id: number) => {
        let { data } = await getNotes({ id });
        if (data.code === RES_SUCCESS) {
          DATA.notes = data.data;
        }
      },
      handleCreateRotes: () => {
        DATA.notesDialogVisible = true;
        DATA.dialogType = true;
        DATA.notesParams = Object.assign(
          {},
          {
            content: '',
          }
        );
      },
      handleEdit: async (item: any) => {
        DATA.notesParams.id = item.id;
        DATA.notesDialogVisible = true;
        DATA.dialogType = false;
        DATA.notesParams = Object.assign({}, item);
      },
      handleRemove: (item: any) => {
        proxy
          .$confirm('是否确定删除该条档案信息备注？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          })
          .then(async () => {
            let { data } = await deleteNotes({ notesId: item.id });
            if (data.code === RES_SUCCESS) {
              proxy.$message({
                type: 'success',
                message: '删除成功!',
              });
              METHODS.handleGetNotes(DATA.id);
            }
          })
          .catch(() => {});
      },
      handleSave: async () => {
        if (DATA.dialogType) {
          let { data } = await createNotes({
            ...DATA.notesParams,
            companyId: DATA.id,
          });
          if (data.code === RES_SUCCESS) {
            ElMessage({
              message: '添加档案信息备注成功',
              type: 'success',
            });
            DATA.notesDialogVisible = false;
            METHODS.handleGetNotes(DATA.id);
          }
        } else {
          delete DATA.notesParams.createTime;
          DATA.notesParams.companyId = DATA.id;
          let { data } = await updateNotes({ ...DATA.notesParams });
          if (data.code === RES_SUCCESS) {
            ElMessage({
              message: '编辑档案信息备注成功',
              type: 'success',
            });
            DATA.notesDialogVisible = false;
            METHODS.handleGetNotes(DATA.id);
          }
        }
      },
    });
    watch(
      () => props.id,
      (newValue) => {
        DATA.id = newValue;
        METHODS.handleGetNotes(newValue);
      }
    );
    onMounted(() => {
      DATA.id = props.id;
      METHODS.handleGetNotes(props.id);
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODS),
      filterTime,
    };
  },
});
</script>
<style scoped lang="scss">
/deep/ .el-textarea__inner {
  height: 300px;
}
</style>