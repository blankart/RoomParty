/** @type {import('next-sitemap').IConfig} */
const config = {
    siteUrl: process.env.NEXT_PUBLIC_WEB_BASE_URL || 'http://localhost:3000',
    generateRobotsTxt: true,
}
  
module.exports = config