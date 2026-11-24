\set QUIET on
\set OWN  '10000000-0000-0000-0000-000000000001'
\set MGR  '10000000-0000-0000-0000-000000000002'
\set WRK  '10000000-0000-0000-0000-000000000004'
\set FA 'f0000000-0000-0000-0000-000000000001'

\echo '== 1 who may edit site settings'
select t_as(:'WRK');
select t_fail('worker cannot write settings', $q$ insert into settings(farm_id,key,value,is_public) values ('f0000000-0000-0000-0000-000000000001','site.name','Hacked',true) $q$, 'row-level security');
select t_as(:'MGR');
select t_ok('manager sets the site name', $q$ insert into settings(farm_id,key,value,is_public) values ('f0000000-0000-0000-0000-000000000001','site.name','Klantis Farms',true) $q$);
select t_ok('manager sets a phone', $q$ insert into settings(farm_id,key,value,is_public) values ('f0000000-0000-0000-0000-000000000001','contact.phone','+233 24 000 0000',true) $q$);

\echo '== 2 only the known site/contact/social keys can be public; values are checked'
select t_fail('cannot publish an arbitrary key', $q$ insert into settings(farm_id,key,value,is_public) values ('f0000000-0000-0000-0000-000000000001','internal.bank_account','123',true) $q$, 'can''t be made public');
select t_ok('a private setting (not public) is allowed', $q$ insert into settings(farm_id,key,value,is_public) values ('f0000000-0000-0000-0000-000000000001','internal.note','x',false) $q$);
select t_fail('social link must be https', $q$ insert into settings(farm_id,key,value,is_public) values ('f0000000-0000-0000-0000-000000000001','social.facebook','javascript:alert(1)',true) $q$, 'https://');
select t_fail('http (not https) refused', $q$ insert into settings(farm_id,key,value,is_public) values ('f0000000-0000-0000-0000-000000000001','social.twitter','http://x.com/a',true) $q$, 'https://');
select t_ok('https social link ok', $q$ insert into settings(farm_id,key,value,is_public) values ('f0000000-0000-0000-0000-000000000001','social.instagram','https://instagram.com/klantisfarms',true) $q$);
select t_fail('bad email refused', $q$ insert into settings(farm_id,key,value,is_public) values ('f0000000-0000-0000-0000-000000000001','contact.email','not-an-email',true) $q$, 'email');
select t_ok('good email ok', $q$ insert into settings(farm_id,key,value,is_public) values ('f0000000-0000-0000-0000-000000000001','contact.email','hello@klantisfarms.com',true) $q$);
select t_fail('over-long value refused', format($q$ insert into settings(farm_id,key,value,is_public) values (%L,'site.tagline',%L,true) $q$, :'FA', repeat('x',601)), 'too long');

\echo '== 3 logo / favicon must be an image from THIS farm''s public library'
select t_ok('logo from own site-media', $q$ insert into settings(farm_id,key,value,is_public) values ('f0000000-0000-0000-0000-000000000001','site.logo','f0000000-0000-0000-0000-000000000001/logo.png',true) $q$);
select t_fail('logo from ANOTHER farm refused', $q$ insert into settings(farm_id,key,value,is_public) values ('f0000000-0000-0000-0000-000000000001','site.favicon','f0000000-0000-0000-0000-000000000002/other.png',true) $q$, 'media library');
select t_fail('a PDF/private file cannot be the favicon', $q$ insert into settings(farm_id,key,value,is_public) values ('f0000000-0000-0000-0000-000000000001','site.favicon','f0000000-0000-0000-0000-000000000001/doc.pdf',true) $q$, 'media library');
select t_fail('an invented path refused', $q$ insert into settings(farm_id,key,value,is_public) values ('f0000000-0000-0000-0000-000000000001','site.og_image','f0000000-0000-0000-0000-000000000001/nope.png',true) $q$, 'media library');
select t_ok('favicon from own library', $q$ insert into settings(farm_id,key,value,is_public) values ('f0000000-0000-0000-0000-000000000001','site.favicon','f0000000-0000-0000-0000-000000000001/fav.png',true) $q$);
select t_ok('clearing an image is allowed', $q$ update settings set value='' where key='site.favicon' $q$);

\echo '== 4 anonymous visitors read only the public settings'
select t_anon();
select t_rows('anon sees the public site settings', $q$ select 1 from settings where key in ('site.name','contact.phone','contact.email','social.instagram','site.logo') $q$, 5);
select t_rows('anon does NOT see the private setting', $q$ select 1 from settings where key='internal.note' $q$, 0);
select t_fail('anon cannot write settings', $q$ insert into settings(farm_id,key,value,is_public) values ('f0000000-0000-0000-0000-000000000001','site.name','x',true) $q$);

\echo '== 5 blog featured image'
select t_as(:'MGR');
select t_ok('post with a featured image from the library', $q$ insert into blog_posts(farm_id,slug,title,featured_image_path,featured_image_alt) values ('f0000000-0000-0000-0000-000000000001','with-img','T','f0000000-0000-0000-0000-000000000001/fav.png','A tractor') $q$);
select t_fail('featured image needs alt text', $q$ insert into blog_posts(farm_id,slug,title,featured_image_path,featured_image_alt) values ('f0000000-0000-0000-0000-000000000001','no-alt','T','f0000000-0000-0000-0000-000000000001/fav.png','') $q$);
select t_fail('featured image from another farm refused', $q$ insert into blog_posts(farm_id,slug,title,featured_image_path,featured_image_alt) values ('f0000000-0000-0000-0000-000000000001','other-farm','T','f0000000-0000-0000-0000-000000000002/other.png','x') $q$, 'media library');
select t_fail('featured image that does not exist refused', $q$ insert into blog_posts(farm_id,slug,title,featured_image_path,featured_image_alt) values ('f0000000-0000-0000-0000-000000000001','ghost','T','f0000000-0000-0000-0000-000000000001/ghost.png','x') $q$, 'media library');
select t_ok('a post may have no image', $q$ insert into blog_posts(farm_id,slug,title) values ('f0000000-0000-0000-0000-000000000001','plain','T') $q$);
select t_as(:'WRK');
select t_fail('worker cannot create a post', $q$ insert into blog_posts(farm_id,slug,title) values ('f0000000-0000-0000-0000-000000000001','w','T') $q$, 'row-level security');

\echo '== 6 images in use cannot be deleted'
select t_as(:'MGR');
select t_fail('cannot delete the logo while it is the site logo', $q$ delete from media where path='f0000000-0000-0000-0000-000000000001/logo.png' $q$, 'site settings');
select t_fail('cannot delete an image that is a post''s featured image', $q$ delete from media where path='f0000000-0000-0000-0000-000000000001/fav.png' $q$, 'featured image');
select t_ok('an unused image can be deleted', $q$ delete from media where path='f0000000-0000-0000-0000-000000000001/doc.pdf' $q$);
select t_ok('after switching the post, the old image can go', $q$ update blog_posts set featured_image_path=null, featured_image_alt=null where slug='with-img' $q$);
select t_ok('...and now it deletes', $q$ delete from media where path='f0000000-0000-0000-0000-000000000001/fav.png' $q$);
reset role;
select t_ok('deleting a whole farm still works (cascade not blocked)', $q$ delete from farms where id='f0000000-0000-0000-0000-000000000002' $q$);
