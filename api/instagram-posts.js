export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
  const userId = process.env.INSTAGRAM_USER_ID
  const username = 'nearbystudio_'

  try {
    let posts = []
    let source = 'none'

    // Try Instagram Basic Display API (graph.instagram.com)
    if (accessToken) {
      const params = new URLSearchParams({
        fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
        limit: '6', // Increased to match UI grid
        access_token: accessToken
      })

      // Use graph.instagram.com for Basic Display API (standard for IG specific tokens)
      const igBasicsUrl = `https://graph.instagram.com/me/media?${params.toString()}`

      const response = await fetch(igBasicsUrl)
      if (response.ok) {
        const payload = await response.json()
        posts = (payload?.data || []).map((item) => {
          const image = item.media_type === 'VIDEO' ? item.thumbnail_url || item.media_url : item.media_url
          return {
            image,
            href: item.permalink,
            alt: item.caption ? item.caption.slice(0, 120) : 'Instagram post'
          }
        }).filter((item) => Boolean(item.image))
        if (posts.length > 0) source = 'instagram-basic'
      } else {
        // Fallback to Facebook Graph API if UserId is provided but Basic Display fails
        // (For cases where the token might be a Facebook Page token)
        const fbGraphUrl = `https://graph.facebook.com/v22.0/${userId}/media?${params.toString()}`
        const fbResponse = await fetch(fbGraphUrl)
        if (fbResponse.ok) {
          const payload = await fbResponse.json()
          posts = (payload?.data || []).map((item) => {
            const image = item.media_type === 'VIDEO' ? item.thumbnail_url || item.media_url : item.media_url
            return {
              image,
              href: item.permalink,
              alt: item.caption ? item.caption.slice(0, 120) : 'Instagram post'
            }
          }).filter((item) => Boolean(item.image))
          if (posts.length > 0) source = 'facebook-graph'
        }
      }
    }

    // Public endpoint fallback when API credentials fail.
    if (posts.length === 0) {
      const response = await fetch(`https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
        headers: {
          'x-ig-app-id': '936619743392459',
          'user-agent': 'Mozilla/5.0'
        }
      })

      if (response.ok) {
        const payload = await response.json()
        const edges = payload?.data?.user?.edge_owner_to_timeline_media?.edges || []
        posts = edges.slice(0, 6).map(({ node }) => ({
          image: node?.thumbnail_src || node?.display_url,
          href: node?.shortcode ? `https://www.instagram.com/p/${node.shortcode}/` : `https://www.instagram.com/${username}/`,
          alt: node?.accessibility_caption || 'Instagram post'
        })).filter((item) => Boolean(item.image))
        if (posts.length > 0) source = 'public'
      }
    }

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    res.status(200).json({ posts, source })
  } catch (error) {
    res.status(500).json({ error: 'Unexpected error while fetching Instagram posts.' })
  }
}
