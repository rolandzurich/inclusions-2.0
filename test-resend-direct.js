const { Resend } = require('resend');

const resend = new Resend('re_an8y4Hrw_J5bcb33jndu9cb2avtyd87vB');

async function testEmail() {
  console.log('📧 Teste Resend direkt...');
  
  try {
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'roland.luthi@gmail.com',
      subject: 'Test-E-Mail von Inclusions',
      html: '<h1>Test</h1><p>Dies ist eine Test-E-Mail.</p>',
      text: 'Dies ist eine Test-E-Mail.',
    });

    console.log('✅ Ergebnis:', JSON.stringify(result, null, 2));
    
    if (result.error) {
      console.error('❌ Fehler:', result.error);
    } else {
      console.log('✅ E-Mail gesendet! ID:', result.data?.id);
      console.log('📧 Prüfe dein Postfach: roland.luthi@gmail.com');
      console.log('📧 Prüfe auch SPAM!');
    }
  } catch (error) {
    console.error('❌ Fehler:', error);
  }
}

testEmail();


