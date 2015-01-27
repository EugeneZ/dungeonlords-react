var React = require('react');

module.exports = React.createClass({
    render: function(){
        return (
            <html lang="en">
                <head>
                    <title>{this.props.title}</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/>
                    <link href="//maxcdn.bootstrapcdn.com/bootswatch/3.3.1/slate/bootstrap.min.css" rel="stylesheet"/>
                    <link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet"/>
                    <script src="//code.jquery.com/jquery-2.1.3.min.js"/>
                    <script src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"/>

                    <link rel="shortcut icon" href="/assets/images/favicon.ico"/>
                    <link rel="icon" sizes="16x16 32x32 64x64" href="/assets/images/favicon.ico"/>
                    <link rel="icon" type="image/png" sizes="196x196" href="/assets/images/favicon-192.png"/>
                    <link rel="icon" type="image/png" sizes="160x160" href="/assets/images/favicon-160.png"/>
                    <link rel="icon" type="image/png" sizes="96x96" href="/assets/images/favicon-96.png"/>
                    <link rel="icon" type="image/png" sizes="64x64" href="/assets/images/favicon-64.png"/>
                    <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/favicon-32.png"/>
                    <link rel="icon" type="image/png" sizes="16x16" href="/assets/images/favicon-16.png"/>
                    <link rel="apple-touch-icon" href="/assets/images/favicon-57.png"/>
                    <link rel="apple-touch-icon" sizes="114x114" href="/assets/images/favicon-114.png"/>
                    <link rel="apple-touch-icon" sizes="72x72" href="/assets/images/favicon-72.png"/>
                    <link rel="apple-touch-icon" sizes="144x144" href="/assets/images/favicon-144.png"/>
                    <link rel="apple-touch-icon" sizes="60x60" href="/assets/images/favicon-60.png"/>
                    <link rel="apple-touch-icon" sizes="120x120" href="/assets/images/favicon-120.png"/>
                    <link rel="apple-touch-icon" sizes="76x76" href="/assets/images/favicon-76.png"/>
                    <link rel="apple-touch-icon" sizes="152x152" href="/assets/images/favicon-152.png"/>
                    <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/favicon-180.png"/>
                    <meta name="msapplication-TileColor" content="#FFFFFF"/>
                    <meta name="msapplication-TileImage" content="/assets/images/favicon-144.png"/>
                    <meta name="msapplication-config" content="/browserconfig.xml"/>

                </head>
                <body>
                    <nav className="navbar navbar-default">
                        <div className="container-fluid">
                            <div className="navbar-header">
                                <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#mainnav">
                                    <span className="sr-only">Toggle navigation</span>
                                    <span className="icon-bar"></span>
                                    <span className="icon-bar"></span>
                                    <span className="icon-bar"></span>
                                </button>
                                <a className="navbar-brand" href="/#/">Dungeon Lords</a>
                            </div>

                            <div className="collapse navbar-collapse" id="mainnav">
                                {this.props.user ? this.renderAuthenticatedNav() : this.renderNav()}
                            </div>

                        </div>
                    </nav>
                    <div className="container">
                        {this.props.children}
                    </div>
                </body>
            </html>
        );
    },

    renderNav: function() {
        return (
            <ul className="nav navbar-nav navbar-right">
                <li><a href="/auth/google">Google Login</a></li>
                <li><a href="#">More Login Methods Coming Soon</a></li>
            </ul>
        );
    },

    renderAuthenticatedNav: function(){
        return (
            <ul className="nav navbar-nav navbar-right">
                <li><a href="/client#/new">New Game</a></li>
                <li><a href="/client#/games">My Games</a></li>
                <li><a href="/client#/search">Search Games</a></li>
                <li><a href="/auth/logout">Log Out {this.props.user.name}</a></li>
            </ul>
        );
    }
});