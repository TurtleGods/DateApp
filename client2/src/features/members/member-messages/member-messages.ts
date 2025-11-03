import { Component, effect, ElementRef, inject, model, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { MessageService } from '../../../core/services/message-service';
import { DatePipe } from '@angular/common';
import { TimeAgoPipe } from '../../../core/pipes/time-ago-pipe';
import { FormsModule } from '@angular/forms';
import { PresenceService } from '../../../core/services/presence-service';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '../../../core/services/account-service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked, Renderer } from 'marked';

@Component({
  selector: 'app-member-messages',
  imports: [DatePipe, TimeAgoPipe, FormsModule],
  templateUrl: './member-messages.html',
  styleUrl: './member-messages.css'
})
export class MemberMessages implements OnInit, OnDestroy {
  @ViewChild('messageEndRef') messageEndRef!: ElementRef
  protected messageService = inject(MessageService);
  protected memberService = inject(MemberService);
  protected presenceService = inject(PresenceService);
  private router = inject(ActivatedRoute);
  protected messageContent = model('');
  private sanitizer = inject(DomSanitizer);
  isTyping = false;
  constructor() {
    effect(() => {
      const currentMessage = this.messageService.messageThread();
      if (currentMessage.length > 0) {
        this.scrollToBottom();
      }
    })
    // ✅ 自訂 Markdown 連結行為
    const renderer = new Renderer();
    renderer.link = ({ href, title, tokens }) => {
      // 直接由 marked.parser() 處理 tokens 內容
      const text = marked.parser(tokens);
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    };
    marked.setOptions({ renderer });

  }
  ngOnDestroy(): void {
    this.messageService.stopHubConnection();
  }

  ngOnInit(): void {
    this.router.parent?.paramMap.subscribe({
      next: params => {
        const otherUserId = params.get('id');
        if (!otherUserId) throw new Error('Cannot connect to hub');
        this.messageService.createHubConnection(otherUserId);
      }
    })
  }


  sendMessage() {
    const recipientId = this.memberService.member()?.id;
    console.log('recipientId', recipientId);
    if (!recipientId || !this.messageContent()) return;
    else if (recipientId === 'openai-id') {
      const content = this.messageContent();
      // 1️⃣ 使用者訊息先送到 Hub（保持一致）
      if (recipientId) {
        this.messageService.sendMessage(recipientId, content);
      }
      this.messageContent.set('');
      // 2️⃣ 再請 Python 回答
      this.messageService.sendOpenAIMessage(content)?.subscribe(async (message) => {
        // message.content 為完整回覆
        const fullText = message.content;
        const typingMessage = { ...message, content: "" }; // 先插入空訊息

        // 先在 UI 新增一個空訊息泡泡
        this.messageService.messageThread.update(messages => [...messages, message]);

        // 逐字輸出
        // this.isTyping = true;
        // for (let i = 0; i < fullText.length; i++) {
        //   typingMessage.content += fullText[i];
        //   // 更新現有 messages 陣列的最後一筆
        //   this.messageService.messageThread.update(messages => {
        //     const updated = [...messages];
        //     updated[updated.length - 1] = { ...typingMessage };
        //     return updated;
        //   });

        //   // 每字延遲（30ms）
        //   await new Promise(res => setTimeout(res, 1));
        // }
        // this.isTyping = false;

      });

    }
    else {
      this.messageService.sendMessage(recipientId, this.messageContent())?.then(() => {
        this.messageContent.set('');
      })
    }

  }

  scrollToBottom() {
    setTimeout(() => {//目的上是希望timeout就scrollDown
      if (this.messageEndRef) {
        this.messageEndRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    })
  }

  renderMarkdown(mdText: string): SafeHtml {
    const html = marked.parse(mdText, { async: false }) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}

