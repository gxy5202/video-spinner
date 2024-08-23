import { defineComponent, onMounted, ref } from "vue";
import { createURL } from 'src/util';
import browser from "webextension-polyfill";
import { showConfirmDialog } from 'vant';

import './index.less';

export default defineComponent({
    name: "CacheList",
    setup(props) {
        const list = ref<any>([]);

        const loadList = () => {
            list.value.length = 0;
            browser.storage.sync.get().then((res) => {
                Object.keys(res).forEach((key) => {
                    const data = res[key];
                    if (key.startsWith("video-roll") && !key.startsWith("video-roll-disabled") && 'deg' in data) {
                        list.value.push({
                            url: data.url,
                            data
                        })
                    }
                })
            })
        }
        onMounted(() => {
            loadList();
        })

        const toUrl = (value: string) => {
            createURL(value);
        }

        const remove = (value: boolean) => {
            browser.storage.sync.remove(`video-roll-${value}`);
            loadList();
        }

        const clear = () => {
            showConfirmDialog({
                message: 'Are you sure you want to clear cache list?',
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then(() => {
                browser.storage.sync.remove(list.value.map((item: any) => `video-roll-${item.url}`));
                loadList();
            });
        }

        return () => (
            <div class="options-general">
                <div class="options-inside-header">
                    <van-button type="primary" size="small" onClick={clear}>{browser.i18n.getMessage('tips_clearAll')}</van-button>
                </div>
                {
                    list.value.map((item: any) => <van-cell key={item.url} v-slots={{
                        title: () => <span title={item.url} class="cell-title" onClick={() => toUrl(item.url)}>{item.url}</span>
                    }}>
                        <van-icon name="close" class="close-icon" color="#ee0a24" onClick={() => remove(item.url)} />
                    </van-cell>)
                }

            </div>
        );
    }
});
