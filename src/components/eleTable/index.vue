<template>
  <el-table
    :data="tableData"
    :border="isborder"
    style="width: 100%"
    :row-key="getRowKey"
    :ref="refsName"
    :fit="true"
    :row-style="rowStyle"
    :cell-style="cellStyle"
    :header-cell-style="headerCellStyle"
    @selection-change="handleSelectionChange"
    class="table"
  >
    <template
      v-for="(item, index) of renderTable"
      :key="index"
    >
      <!-- slot -->
      <el-table-column
        :label="item.label"
        v-if="item.type === 'slot'"
        :reserve-selection="true"
        :width="item.width || ''"
      >
        <template v-slot="scope">
          <slot
            :name="item.slotName"
            :row="scope.row"
          ></slot>
        </template>
      </el-table-column>
      <!-- 多选 -->
      <el-table-column
        v-if="item.type === 'selection'"
        type="selection"
        :reserve-selection="true"
        width="55"
      >
      </el-table-column>
      <!-- 展开行 -->
      <el-table-column
        v-if="item.type === 'expand'"
        type="expand"
        width="50"
        #default="scoped"
        @click="handleClickColumn(scoped.row)"
      >
        <el-table
          :data="scoped.row[item.dataName]"
          :border="isborder"
          style="width: 100%; margin-top: 10px"
        >
          <template
            v-for="(val, index) of randerExpandTable"
            :key="index"
          >
            <!-- 文本 -->
            <el-table-column
              :label="val.label"
              :show-overflow-tooltip="true"
              :prop="val.prop"
              :formatter="val.formatter"
              :sortable="val.sortable"
              align="center"
              v-if="val.type === 'text'"
            >
            </el-table-column>

            <!-- switch -->
            <el-table-column
              :label="val.label"
              :prop="val.prop"
              v-if="val.type === 'switch'"
              #default="scoped"
              align="center"
            >
              <el-switch
                v-model="scoped.row[val.prop]"
                :active-color="val.color || '#13ce66'"
                @change="handleEmitChange(scoped.row)"
              >
              </el-switch>
            </el-table-column>

            <!-- tag -->
            <el-table-column
              :label="val.label"
              :prop="val.prop"
              v-if="val.type === 'tag'"
              align="center"
              #default="scoped"
            >
              <el-tag :type="val.tagType">{{ scoped.row[val.prop] }}</el-tag>
            </el-table-column>
          </template>
        </el-table>
      </el-table-column>

      <!-- 文本 -->
      <el-table-column
        :label="item.label"
        :show-overflow-tooltip="item.tooltip === false ? item.tooltip : true"
        :prop="item.prop"
        :formatter="item.formatter"
        :sortable="item.sortable"
        align="center"
        v-if="item.type === 'text'"
        :fixed="item.fixed"
        :width="item.width || ''"
      >
      </el-table-column>

      <!-- 多行文本 -->
      <el-table-column
        :label="item.label"
        :prop="item.prop"
        :sortable="item.sortable"
        align="center"
        v-if="item.type === 'multilineText'"
        :fixed="item.fixed"
        #default="scoped"
      >
        <div v-html="item.formatter(scoped.row)"></div>
      </el-table-column>

      <!-- 多段文本 -->
      <el-table-column
        :label="item.label"
        :show-overflow-tooltip="true"
        :prop="item.prop"
        :sortable="item.sortable"
        align="center"
        v-if="item.type === 'moreText'"
        :fixed="item.fixed"
        #default="scoped"
      >
        <span>{{ item.formatter(scoped.row) }}</span>
      </el-table-column>

      <!-- switch -->
      <el-table-column
        :label="item.label"
        :prop="item.prop"
        v-if="item.type === 'switch'"
        #default="scoped"
        align="center"
      >
        <el-switch
          :disabled="
            item.condition ? item.condition(scoped.row).isdisable : false
          "
          v-model="scoped.row[item.prop]"
          :active-color="item.color || '#13ce66'"
          @change="handleEmitChange(scoped.row, item)"
        >
        </el-switch>
      </el-table-column>

      <!-- tag -->
      <el-table-column
        :label="item.label"
        :prop="item.prop"
        v-if="item.type === 'tag'"
        :show-overflow-tooltip="false"
        align="center"
        #default="scoped"
        :min-width="item.moreTag ? 130 : 80"
        :width="item.width"
      >
        <template v-if="item.moreTag">
          <div
            style="display: flex; justify-content: center"
            class="tag"
          >
            <el-tag
              v-for="(val, index) of item.formatter(scoped.row)"
              :key="'tag' + index"
              :type="val.tagType"
              :effect="val.effect || 'light'"
            >{{ val.text }}</el-tag>
          </div>
        </template>
        <el-tag
          v-else
          :type="item.formatter(scoped.row).tagType"
          :effect="item.formatter(scoped.row).effect || 'light'"
        >{{ item.formatter(scoped.row).text }}</el-tag>
      </el-table-column>

      <!-- image -->
      <el-table-column
        :label="item.label"
        :prop="item.prop"
        v-if="item.type === 'image'"
        align="center"
        #default="scoped"
      >
        <div v-if="item.moreImage">
          <el-image
            v-for="val of scoped.row[item.prop]"
            :key="val.id"
            :src="IMG_File + val[item.value]"
            :fit="item.fit || 'cover'"
            style="height:90px"
          ></el-image>
        </div>

        <el-image
          v-else
          :src="IMG_File + scoped.row[item.prop]"
          :fit="item.fit || 'cover'"
          style="height:90px"
          @click="handlePreview()"
          :class="isPreview && 'pointer'"
        ></el-image>

      </el-table-column>

      <!-- file -->
      <el-table-column
        :label="item.label"
        :prop="item.prop"
        v-if="item.type === 'file'"
        align="center"
        #default="scoped"
      >
        <div
          v-if="item.moreFile"
          class="d_felx d_flex_column"
        >
          <a
            v-for="val of scoped.row[item.prop]"
            :key="val.id"
            :href="val[item.href]"
            target="_blank"
            style="display:block"
            class="mb-5 text-ellipsis"
            :title="val[item.name]"
          >
            {{val[item.name]}}
          </a>
        </div>
        <a
          v-else
          :href="scoped.row[item.href]"
          target="_blank"
          class="text-ellipsis"
          :title="scoped.row[item.name]"
        >
          {{scoped.row[item.name]}}
        </a>
      </el-table-column>

      <!-- button -->
      <el-table-column
        :label="item.label"
        :prop="item.prop"
        :width="item.width"
        #default="scoped"
        v-if="item.type === 'handle' && btnList.some(item=>  item.isShow)"
        align="center"
      >
        <div class="d_flex d_flex_c">
          <el-button
            v-for="(val, i) of btnList"
            :key="i"
            :type="val.condition ? val.condition(scoped.row).type : val.type"
            @click="handleBtnEvent(scoped.row, val)"
            :disabled="val.condition ? val.condition(scoped.row).isdisable : ( val.isdisable  ? typeof val.isdisable === 'function' ? val.isdisable() :
           val.isdisable : false)"
            :plain="val.plain ? val.plain : false"
            :size="val.condition ? val.condition(scoped.row).size : val.size"
            v-show="val.isShow"
          >
            {{ val.condition ? val.condition(scoped.row).text : val.text }}
          </el-button>
        </div>
      </el-table-column>

      <!--icon-button -->
      <el-table-column
        :label="item.label"
        :prop="item.prop"
        :width="item.width"
        v-if="item.type === 'iconHandle' && iconList.some(item=>  item.isShow)"
        align="center"
        #default="scoped"
      >
        <div class="d_flex d_flex_c">
          <template
            v-for="(val, i) of iconList"
            :key="i"
          >
            <el-tooltip
              class="item"
              effect="light"
              :content="val.condition ? val.condition(scoped.row).text : val.text"
              placement="top"
              v-if="val.isShow"
            >
              <i
                class="iconfont"
                :class="val.condition ? val.condition(scoped.row).icon : val.icon"
                @click="handleBtnEvent(scoped.row, val)"
                :style="{
                  color: val.condition ? val.condition(scoped.row).color : val.color,
                }"
              >
              </i>
            </el-tooltip>
          </template>
        </div>
      </el-table-column>
    </template>
  </el-table>
</template>
<script lang="ts">
import { defineComponent, getCurrentInstance, reactive, toRefs } from 'vue';
import { IMG_File } from '@/api/common/common';
import Viewer from 'viewerjs';
import 'viewerjs/dist/viewer.css';
export default defineComponent({
  props: {
    // 表格数据
    tableData: {
      type: Array,
      default: [],
    },
    // 表格边框
    isborder: {
      type: Boolean,
      default: false,
    },
    // 自定义渲染表格
    renderTable: {
      type: Array,
      default: [],
    },
    // 表格操作按钮
    btnList: {
      type: Array,
      default: [],
    },
    // 表格图标操作按钮
    iconList: {
      type: Array,
      default: [],
    },
    // 表格折叠行自定义渲染
    randerExpandTable: {
      type: Array,
      default: [],
    },
    // ref名称
    refsName: {
      type: String,
      default: '',
    },
    // 行的 style
    rowStyle: {
      type: Function,
      default: () => {},
    },
    // 单元格的style
    cellStyle: {
      type: Function,
      default: () => {},
    },
    headerCellStyle: {
      type: Object,
      default: {},
    },
    // 预览图片
    isPreview: {
      type: Boolean,
      default: false,
    },
  },
  // 定义抛出的事件名称
  emits: [
    'handleSelectionChange',
    'handleBtnEvent',
    'handleEmitChange',
    'handleClickColumn',
  ],
  setup(props, { emit }) {
    // 获取vue实例化对象
    let { proxy }: any = getCurrentInstance();
    let DATA: any = reactive({
      columnAlign: 'right',
    });
    let METHODES: any = reactive({
      handleSelectionChange: (val: any): void => {
        emit('handleSelectionChange', val);
      },
      handleBtnEvent: (row: any, val: any): void => {
        emit('handleBtnEvent', { row, val });
      },
      handleEmitChange: (val: any, item: any): void => {
        emit('handleEmitChange', val, item);
      },
      handleClickColumn: (row: any) => {
        emit('handleClickColumn', row);
      },
      getRowKey: (row: any) => {
        return row.id + '';
      },
      clearSelection: () => {
        proxy.$refs[props.refsName].clearSelection();
      },
      // 预览图片
      handlePreview: () => {
        if (props.isPreview) {
          var imageTable = document.querySelector('.table') as HTMLElement;
          new Viewer(imageTable, {
            toolbar: {
              zoomIn: 4,
              zoomOut: 4,
              oneToOne: 4,
              reset: 4,
              prev: 4,
              play: {
                show: 4,
                size: 'large',
              },
              next: 4,
              rotateLeft: 4,
              rotateRight: 4,
              flipHorizontal: 4,
              flipVertical: 4,
            },
          });
        }
      },
    });
    return {
      ...toRefs(DATA),
      ...toRefs(METHODES),
      IMG_File,
    };
  },
});
</script>
<style lang="scss" scoped>
.tag {
  .el-tag {
    margin-right: 5px;
  }
  &:last-child {
    margin-right: -5px;
  }
}
.pointer {
  cursor: pointer;
}
.iconfont {
  cursor: pointer;
  font-size: 20px;
  margin: 0 10px 0 10px;
}
a {
  text-decoration: none;
  color: #33a6dc;
}
</style>