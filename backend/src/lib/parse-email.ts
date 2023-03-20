import { simpleParser, type AddressObject, type ParsedMail } from 'mailparser'
import replyParser from 'node-email-reply-parser'

export interface ParseEmailResult {
  sender: string
  recipient: string
  date: Date
  subject: string
  text: string
}

export async function parseEmail(message: string): Promise<ParseEmailResult> {
  const email: ParsedMail = await simpleParser(message)
  return {
    sender: email.from?.value[0].address ?? '',
    recipient: (email.to as AddressObject)?.value[0].address ?? '',
    date: email.date ?? new Date(),
    subject: email.subject ?? '',
    text: replyParser(email.text ?? '', true).trim()
  }
}

const testMessage = `Return-Path: <johnmroyal1@gmail.com>
Received: from mail-wm1-f50.google.com (mail-wm1-f50.google.com [209.85.128.50])
 by inbound-smtp.us-east-1.amazonaws.com with SMTP id q041v1u3p6g5bust1o2se9of7vf685mtivi7ci01
 for 23@connecto.johnmroyal.com;
 Mon, 20 Mar 2023 03:11:44 +0000 (UTC)
X-SES-Spam-Verdict: PASS
X-SES-Virus-Verdict: PASS
Received-SPF: pass (spfCheck: domain of _spf.google.com designates 209.85.128.50 as permitted sender) client-ip=209.85.128.50; envelope-from=johnmroyal1@gmail.com; helo=mail-wm1-f50.google.com;
Authentication-Results: amazonses.com;
 spf=pass (spfCheck: domain of _spf.google.com designates 209.85.128.50 as permitted sender) client-ip=209.85.128.50; envelope-from=johnmroyal1@gmail.com; helo=mail-wm1-f50.google.com;
 dkim=pass header.i=@gmail.com;
 dmarc=pass header.from=gmail.com;
X-SES-RECEIPT: AEFBQUFBQUFBQUFHZFR2NW1rRTBwbWk1WGVPMStoT2Z6U0c1YnNZUWkwWSsxWEMyM1BWeFlTbDY3NmJNVkMrN2F5MUFPSHB2cHRhTEhWdFRWTUg4eUMyVUJoaUxTQzBxc2RtT0xBR2hIUXlIYVNoYmJHNm0wRDBXaVM0b2wvTmNoL1JhSmdEUTVrZ05zem1zSVhyWE03MURsWDMxbmV6bEFwYUh6TEJYOVRxRlJsTHpJbmJVc1VmMFI2RTdzZDJLQ3FJZGlOSmw4K3NWdEZKb1VVUzlGU0NBUG5Bd1pHbk5sWk9odGNhS2dmakJqTHo0WEZmSlFqbXBLOHo2cjBSR1BtSWlSM3ljVVpMay8xZVU3ekNpenNrU2dkczIzSXdCQUFVMkoydGJQR3QyNkNXNURsYTNIMXc9PQ==
X-SES-DKIM-SIGNATURE: a=rsa-sha256; q=dns/txt; b=M2UWv/y3F1nHRVlfxRUsu6//2pWa+XNoDrOkvrfpcC7kkqTfAKI+3eIorMCEAI+/R/mCoJj2y0VhoWquNQUqcyVJPQ9yqqiMzR93qKUd1++WYw/BL1Ch4lkjDCx0XUEbPTigsM3J8YZXlqgDGvuWOI3J+bqWXSPG3c7j4Xkf5K4=; c=relaxed/simple; s=224i4yxa5dv7c2xz3womw6peuasteono; d=amazonses.com; t=1679281904; v=1; bh=OwEaqoTbL8nGjMlJbz9GA9hi8Buj82SJebm1MK4LOsU=; h=From:To:Cc:Bcc:Subject:Date:Message-ID:MIME-Version:Content-Type:X-SES-RECEIPT;
Received: by mail-wm1-f50.google.com with SMTP id l15-20020a05600c4f0f00b003ed58a9a15eso6599398wmq.5
        for <23@connecto.johnmroyal.com>; Sun, 19 Mar 2023 20:11:43 -0700 (PDT)
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed;
        d=gmail.com; s=20210112; t=1679281902;
        h=to:subject:message-id:date:from:in-reply-to:references:mime-version
         :from:to:cc:subject:date:message-id:reply-to;
        bh=/WxMVxouoT8QHybJxQA+p814EXN9DERrUJoe6Lib0Uw=;
        b=U+aGJXBXc3UkEzVgqi0e9YbW3bMX4FqNJO6PNiiLmQsExYk7XumobZhD+OPPw0FdNu
         k6F3xr6Kzc/78Dy7rQwWiklY0A2hplNYHvouq1Bgvh2GAmD4dQT2H1zH7nLkGHOq7DRt
         U8nBzF7XfhWv1AGt6PMRRr2vdOtewFoVopZedhVn6t9TbDiyk2uIVvSgK0X/rNsq9AKY
         Ng2li06u8GYZfKPZu7fmzG2xk2jroa8OWFw2W0L7EtshQ1SAoM4nK7jbCbaraS0oZzWS
         5Zee8hlr1y+Qr1vC4yzsGec32PwLfron6rdM7wOwtY8u7pUr2x1mc20baJ013wX1O+et
         3PyA==
X-Google-DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed;
        d=1e100.net; s=20210112; t=1679281902;
        h=to:subject:message-id:date:from:in-reply-to:references:mime-version
         :x-gm-message-state:from:to:cc:subject:date:message-id:reply-to;
        bh=/WxMVxouoT8QHybJxQA+p814EXN9DERrUJoe6Lib0Uw=;
        b=h2M7Obn0paKZoe2iXYCyw3fsXO4LHzPGF3ilrlGwTOjPSERezu13hNZ9Fkj6ryGOJb
         V8JdlhRbe5yX5Ojs3QyIPGaFE7J0G/Gj1BCHiUTFOHvP04DDd/V0fB0bryn9oGP7bpcG
         PhexQxBLgs0McXNSiGkLf9EpNEdvAiyirZ9a58whKZJEa7khypUBM/U9q1GvnMe1/JOS
         swRVR6Qgrw4/X5Z2KNk5q1aHSdJuh8aEJb58pH10Qqy5q9kwGF+Pz2Yd8/6kJ8VaxW1g
         LMROTxv7+sZee7YVfq8vUp7mcEg/6hde9uhuCogBzdQcuSeL3lhR3pEAzFhI5smHYLCQ
         WibA==
X-Gm-Message-State: AO0yUKWLHVBwpgz44evdWDybQ0HLBWTeo2ITqcWo5TALj/GVQ8Jt3LZq
    CI1pTAdilgWN0BGOLwxGXhsJYcR+fSPuHVC+EGbafR/uPO8=
X-Google-Smtp-Source: AK7set/DHtZtcRzICNVeC2x93RCklIn3iDdEzChyDWePvwwrJtIh2CoNrGqHAnP0n36R1ISm/E4fiuKQlta30YAHrro=
X-Received: by 2002:a7b:c445:0:b0:3ed:abb9:751e with SMTP id
 l5-20020a7bc445000000b003edabb9751emr1507461wmi.5.1679281902383; Sun, 19 Mar
 2023 20:11:42 -0700 (PDT)
MIME-Version: 1.0
References: <01000186fcedd756-a86b0610-7650-474a-bcd5-2461d14e96c0-000000@email.amazonses.com>
In-Reply-To: <01000186fcedd756-a86b0610-7650-474a-bcd5-2461d14e96c0-000000@email.amazonses.com>
From: John Royal <johnmroyal1@gmail.com>
Date: Sun, 19 Mar 2023 23:11:31 -0400
Message-ID: <CADS5oMb1H9y5X7x4q0sgf3Z7jQAHH0MG3cn_NjgDdsdtzsFErA@mail.gmail.com>
Subject: Re: New message from Funcho
To: 23@connecto.johnmroyal.com
Content-Type: multipart/alternative; boundary="00000000000044f86805f74c491e"

--00000000000044f86805f74c491e
Content-Type: text/plain; charset="UTF-8"
Content-Transfer-Encoding: quoted-printable

Test yes test

On Sun, Mar 19, 2023 at 10:51 PM Connecto <hello@connecto.johnmroyal.com>
wrote:

> Connecto
> Funcho sent a new message:
>
> test
> =C2=A9 Connecto. All rights reserved.
>

--00000000000044f86805f74c491e
Content-Type: text/html; charset="UTF-8"
Content-Transfer-Encoding: quoted-printable

<div dir=3D"auto">Test yes test</div><div><br><div class=3D"gmail_quote"><d=
iv dir=3D"ltr" class=3D"gmail_attr">On Sun, Mar 19, 2023 at 10:51 PM Connec=
to &lt;<a href=3D"mailto:hello@connecto.johnmroyal.com">hello@connecto.john=
mroyal.com</a>&gt; wrote:<br></div><blockquote class=3D"gmail_quote" style=
=3D"margin:0px 0px 0px 0.8ex;border-left-width:1px;border-left-style:solid;=
padding-left:1ex;border-left-color:rgb(204,204,204)">
      <div style=3D"font-family:Arial,sans-serif;max-width:600px;margin:0px=
 auto">
        <h1 style=3D"text-align:center;padding:20px;font-family:Arial,sans-=
serif;background-color:rgb(76,175,80);color:white">Connecto</h1>
        <div style=3D"padding:20px;font-family:Arial,sans-serif;background-=
color:white">
          <h2 style=3D"font-family:Arial,sans-serif">Funcho sent a new mess=
age:</h2>
          <p style=3D"font-family:Arial,sans-serif">test</p>
         =20
         =20
        </div>
        =C2=A9 Connecto. All rights reserved.
      </div>
    </blockquote></div></div>

--00000000000044f86805f74c491e--`

parseEmail(testMessage).then(console.log).catch(console.error)
