Add-Type -AssemblyName System.Speech

$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$s.SelectVoice("Microsoft Zira Desktop")
$s.Rate = -1
$path = "C:\Users\recoveryadmin\OneDrive - Deco Metal\WORK\OTHERS\MASTER - YASH\MARKETING\TECH\WEBSITE\existing-new\work\reels\moldart-site-reel\assets\narration.wav"
$s.SetOutputToWaveFile($path)
$ssml = @"
<speak version="1.0" xml:lang="en-US">
  <prosody rate="-5%">
    China sourcing, clarified.
    <break time="650ms"/>
    Start with the application.
    <break time="500ms"/>
    Search products, solutions, guides, and documents in one place.
    <break time="700ms"/>
    Read the technical note.
    <break time="550ms"/>
    Prepare the R F Q better.
    <break time="700ms"/>
    Explore Moldart.
  </prosody>
</speak>
"@
$s.SpeakSsml($ssml)
$s.Dispose()
Write-Output "ok"
