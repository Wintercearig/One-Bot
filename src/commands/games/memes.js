/* eslint-disable no-mixed-spaces-and-tabs */
const { EmbedBuilder } = require('discord.js');
const got = require('got');

module.exports = {
  name: 'meme',
  description: 'Gives you delicious memes!',
  category: 'games',
  run: async (client, message) => {
    const fetchNonNSFWMeme = async () => {
      try {
        const response = await got('https://www.reddit.com/r/memes/random/.json');
        const [list] = JSON.parse(response.body);
        const [post] = list.data.children;

        if (post.data.over_18 && !message.channel.nsfw) {
          await fetchNonNSFWMeme();
          return;
        }

        const permalink = post.data.permalink;
        const memeUrl = `https://reddit.com${permalink}`;
        const mediaUrl = post.data.is_video ? getStaticGifUrl(post) : post.data.url;

        const memeTitle = post.data.title;
        const memeUpvotes = post.data.ups;
        const memeNumComments = post.data.num_comments;
        const memeAuthor = post.data.author;
        const authorFlairColor = post.data.author_flair_background_color;
        const embedColor = authorFlairColor || process.env.theme;
        const memeAuthorURL = `https://www.reddit.com/user/${memeAuthor}`;

		const embed = new EmbedBuilder()
		  .setAuthor({name: memeAuthor, url: memeAuthorURL})
		  .setTitle(memeTitle)
		  .setURL(memeUrl)
		  .setImage(mediaUrl)
          .setColor(`${embedColor}`)
          .setFooter({ text: `👍 ${memeUpvotes} | 💬 ${memeNumComments}` })
          .setTimestamp(post.data.created_utc * 1000);

        message.channel.send({ embeds: [embed] });
      } catch (error) {
        console.error('Error fetching meme:', error);
      }
    };

    // Function to get the static image URL of a GIF
    const getStaticGifUrl = (post) => {
		// Check if the post has a preview and images array
		if (post.data.preview && post.data.preview.images && post.data.preview.images[0]) {
		  // Extract the URL of the static image from the preview
		  return post.data.preview.images[0].source.url;
		}
		// If no preview or images array is found, return the original GIF URL
		return post.data.url;
	  };
    fetchNonNSFWMeme();
  }
};
