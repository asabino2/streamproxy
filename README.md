<pre class="fig-ansi" contenteditable="true">███████╗████████╗██████╗ ███████╗ █████╗ ███╗   ███╗    ██████╗ ██████╗  ██████╗ ██╗  ██╗██╗   ██╗
██╔════╝╚══██╔══╝██╔══██╗██╔════╝██╔══██╗████╗ ████║    ██╔══██╗██╔══██╗██╔═══██╗╚██╗██╔╝╚██╗ ██╔╝
███████╗   ██║   ██████╔╝█████╗  ███████║██╔████╔██║    ██████╔╝██████╔╝██║   ██║ ╚███╔╝  ╚████╔╝ 
╚════██║   ██║   ██╔══██╗██╔══╝  ██╔══██║██║╚██╔╝██║    ██╔═══╝ ██╔══██╗██║   ██║ ██╔██╗   ╚██╔╝  
███████║   ██║   ██║  ██║███████╗██║  ██║██║ ╚═╝ ██║    ██║     ██║  ██║╚██████╔╝██╔╝ ██╗   ██║   
╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝    ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   <br /><br />Streamproxy is a proxy for livestreams<br /><br /></pre>
<p>with it you can watch livestreams from youtube, twitch (and any other that can be accessed through the streamlink app) by other iptv apps, such as SSIPTV, tvheadend, ProgTV, etc..</p>
<p>To start the server, run from the command prompt<br />streamproxy &lt;PORT&gt;</p>
<p>where &lt;port&gt; is the server listening port, if omitted, port 3000 will be used by default</p>
<p>In your favorite iptv app, you will put in the url one of the following options</p>
<ul>
<li>http://&lt;serverip&gt;:&lt;port&gt;/videostream/streamlink?url=&lt;livestreamurl&gt;
<ul>
<li>Livestream will be routed from a live stream url to any url that is streamlink compatible, video and audio codecs will be passthruded</li>
<li>Ex: http://localhost:3000//videostream/streamlink?url=https://www.youtube.com/c/SkyNews/live<br />To display the skynews live stream on your iptv app</li>
</ul>
</li>
</ul>
<p>&nbsp;</p>
<ul>
<li>http://&lt;serverip&gt;:&lt;port&gt;/videostream/ffmpeg?url=&lt;livestreamurl&gt;
<ul>
<li>The livestream will be routed and transcoded to MPEG-2 TS format from a live stream url of any url that ffmpeg supports.</li>
<li>Ex: http://localhost:3000//videostream/ffmpeg?url=https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8<br />To display the live stream of Redbull TV in MPEG2 TS format on your iptv app</li>
</ul>
<p>&nbsp;</p>
</li>
<li>http://&lt;serverip&gt;:&lt;port&gt;/videostream/info?url=&lt;livestreamurl&gt;
<ul>
<li>Retrieve livestream information through ffprobe, output will be in json format</li>
<li>Ex: http://localhost:3000//videostream/info?url=https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8<br />Displays information about the Redbull TV livestream</li>
</ul>
<p>&nbsp;</p>
</li>
<li>http://&lt;serverip&gt;:&lt;port&gt;/videostream/checkstream?url=&lt;livestreamurl&gt;
<ul>
<li>checks if a stream is online or offline, the output will be in json format</li>
<li>Ex: http://localhost:3000//videostream/info?url=https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8<br />returns if the Redbull TV stream is online</li>
</ul>
</li>
</ul>
