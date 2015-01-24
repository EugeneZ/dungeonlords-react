var React = require('react'),
    Template = require('./template');

module.exports = React.createClass({
    render: function(){
        return (
            <Template title={this.props.title} user={this.props.isAuthenticated ? this.props.user : null}>
                <div className="row">
                    <div className="col-sm-12">
                        <p className="lead">
                            <a style={{ float: 'left' }} href="http://www.amazon.com/gp/product/B00359OCFC/ref=as_li_qf_sp_asin_il_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B00359OCFC&linkCode=as2&tag=dunglordhelp-20&linkId=WN3AZMBUEWSKVHGP">
                                <img style={{ margin: '0 1em' }} className="img-responsive" alt="Buy Dungeon Lords on Amazon.com" title="Buy Dungeon Lords on Amazon.com" src="http://ecx.images-amazon.com/images/I/516Apk0RciL._SY300_.jpg"/>
                            </a>
                            Welcome to the online <strong>Dungeon Lords</strong> simulator tool. Dungeon Lords is a board game
                            created by <a href="http://czechgames.com/">Czech Games Edition</a> and designed by Vlaada Chvatil.
                        </p>
                        <p>
                            It is a game for 2-4 players in which they play dungeon lords competing with each other for the best
                            dungeon. We recommend purchasing a copy of the board game by clicking the image on the left or going
                            to Czech Games Edition's website and purchasing from one of their international publishers. This will
                            allow you to learn the rules and enjoy the game with your friends at the table. <strong>This website
                            is not related to, sponsored, or connected in any way to the creators of the board game. It is an
                            unofficial way to play over the internet if you own a copy of the game.</strong>
                        </p>
                        <p>To begin, login by using one of the buttons at the top of this page.</p>
                    </div>
                </div>
            </Template>
        );
    }
});