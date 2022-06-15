const express = require('express')
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/add', isLoggedIn, (req,res) => {
    res.render('links/add');
})

router.post('/add', isLoggedIn, async (req,res) => {
    const { title, url, description} = req.body;
    const newLink = {
        title, 
        url,
        description,
        user_id: req.user.id
    };

    console.log(newLink);
    await pool.query('insert into links set ?', [newLink]);
    req.flash('success','Link saved successfully');
    res.redirect('/links')
})

// Main Page
router.get('/', isLoggedIn, async (req,res) => {
    const links = await pool.query('select * from links where user_id = ?', [req.user.id]);
    console.log(links);
    res.render('links/list', { links });
})

router.get('/delete/:id', isLoggedIn, async (req,res) => {
    const { id } = req.params;
    await pool.query('delete from links where id = ?', [id]);
    req.flash('success','Links Removed Successfully')
    res.redirect('/links')
})

router.get('/edit/:id', isLoggedIn, async (req,res) => {
    const { id } = req.params;
    const links = await pool.query('select * from links where id = ?', [id]);
    res.render('links/edit', {link: links[0]});
})

router.post('/edit/:id', isLoggedIn, async (req,res) => {
    const { id } = req.params;
    const {title,description,url} = req.body;
    const newLink = {
        title,
        description,
        url
    };
    
    await pool.query('update links set ? where id = ?', [newLink, id]);
    req.flash('success','Links Updated Successfully')
    res.redirect('/links');
})

module.exports = router;