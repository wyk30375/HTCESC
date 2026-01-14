import { ScrollArea } from '@/components/ui/scroll-area';

export default function DisclaimerContent() {
  return (
    <ScrollArea className="h-64 w-full rounded-md border p-4">
      <div className="space-y-4 text-sm">
        <h3 className="font-bold text-base">易驰汽车平台服务协议及免责条款</h3>
        
        <section>
          <h4 className="font-semibold mb-2">一、服务说明</h4>
          <p className="text-muted-foreground leading-relaxed">
            1.1 易驰汽车平台（以下简称"本平台"）为二手车行提供车辆展示、信息管理等服务。
          </p>
          <p className="text-muted-foreground leading-relaxed">
            1.2 车行注册并使用本平台服务，即表示同意遵守本协议的所有条款。
          </p>
        </section>

        <section>
          <h4 className="font-semibold mb-2">二、车行责任</h4>
          <p className="text-muted-foreground leading-relaxed">
            2.1 车行应确保提供的营业执照、联系方式等信息真实、准确、完整。
          </p>
          <p className="text-muted-foreground leading-relaxed">
            2.2 车行应确保发布的车辆信息真实有效，不得发布虚假信息或误导性内容。
          </p>
          <p className="text-muted-foreground leading-relaxed">
            2.3 车行应遵守国家相关法律法规，合法经营，不得从事任何违法违规活动。
          </p>
          <p className="text-muted-foreground leading-relaxed">
            2.4 车行应妥善保管账号密码，对账号下的所有操作承担责任。
          </p>
        </section>

        <section>
          <h4 className="font-semibold mb-2">三、平台权利</h4>
          <p className="text-muted-foreground leading-relaxed">
            3.1 本平台有权审核车行提交的注册信息，对不符合要求的申请予以拒绝。
          </p>
          <p className="text-muted-foreground leading-relaxed">
            3.2 本平台有权对车行发布的信息进行审核，对违规内容进行删除或屏蔽。
          </p>
          <p className="text-muted-foreground leading-relaxed">
            3.3 本平台有权根据实际情况调整服务内容、收费标准等，并提前通知车行。
          </p>
          <p className="text-muted-foreground leading-relaxed">
            3.4 对于违反本协议或相关法律法规的车行，本平台有权暂停或终止其服务。
          </p>
        </section>

        <section>
          <h4 className="font-semibold mb-2">四、免责声明</h4>
          <p className="text-muted-foreground leading-relaxed">
            4.1 本平台仅提供信息展示服务，不参与车行与客户之间的交易，不对交易结果承担责任。
          </p>
          <p className="text-muted-foreground leading-relaxed">
            4.2 因不可抗力、系统维护、网络故障等原因导致的服务中断，本平台不承担责任。
          </p>
          <p className="text-muted-foreground leading-relaxed">
            4.3 车行因自身原因（如信息不实、违规操作等）导致的损失，本平台不承担责任。
          </p>
          <p className="text-muted-foreground leading-relaxed">
            4.4 本平台不对第三方链接的内容、安全性等承担责任。
          </p>
        </section>

        <section>
          <h4 className="font-semibold mb-2">五、隐私保护</h4>
          <p className="text-muted-foreground leading-relaxed">
            5.1 本平台承诺保护车行的隐私信息，不会向第三方泄露或出售。
          </p>
          <p className="text-muted-foreground leading-relaxed">
            5.2 本平台可能会收集车行的使用数据用于服务优化，但不会涉及敏感信息。
          </p>
        </section>

        <section>
          <h4 className="font-semibold mb-2">六、协议变更</h4>
          <p className="text-muted-foreground leading-relaxed">
            6.1 本平台有权根据实际情况修改本协议，修改后的协议将在平台上公布。
          </p>
          <p className="text-muted-foreground leading-relaxed">
            6.2 车行继续使用本平台服务，即视为同意修改后的协议。
          </p>
        </section>

        <section>
          <h4 className="font-semibold mb-2">七、争议解决</h4>
          <p className="text-muted-foreground leading-relaxed">
            7.1 因本协议引起的争议，双方应友好协商解决。
          </p>
          <p className="text-muted-foreground leading-relaxed">
            7.2 协商不成的，任何一方可向本平台所在地人民法院提起诉讼。
          </p>
        </section>

        <section className="pt-4 border-t">
          <p className="text-muted-foreground leading-relaxed font-medium">
            本协议自车行勾选同意并提交注册申请之日起生效。
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            最后更新时间：2026年1月
          </p>
        </section>
      </div>
    </ScrollArea>
  );
}
