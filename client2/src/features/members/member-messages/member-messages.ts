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
import { marked } from 'marked';

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
  constructor() {
    effect(() => {
      const currentMessage = this.messageService.messageThread();
      if (currentMessage.length > 0) {
        this.scrollToBottom();
      }
    })
  }
  ngOnDestroy(): void {
    this.messageService.stopHubConnection();
  }

  ngOnInit(): void {
    this.router.parent?.paramMap.subscribe({
      next:params=>{
        const otherUserId = params.get('id');
        if(!otherUserId) throw new Error('Cannot connect to hub');
        this.messageService.createHubConnection(otherUserId);
      }
    })
  }


  sendMessage() {
    const recipientId = this.memberService.member()?.id;
    console.log('recipientId',recipientId);
    if (!recipientId||!this.messageContent()) return;
    else if(recipientId==='openai-id'){
      const content = this.messageContent();
      // 1️⃣ 使用者訊息先送到 Hub（保持一致）
      if (recipientId) {
        this.messageService.sendMessage(recipientId, content);
      }
      this.messageContent.set('');
      // 2️⃣ 再請 Python 回答
      this.messageService.sendOpenAIMessage(content)?.subscribe((message) => {
        // AI 回覆直接 append 到訊息串
      this.messageService.messageThread.update(messages => [...messages, message]);
      });
    }
    else{
    this.messageService.sendMessage(recipientId, this.messageContent())?.then(()=>{
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

