import React from 'react';
import {
    Row, Col,
} from 'reactstrap';

import {
    PagePosts
} from 'components';

import { pages } from 'variables/blog/pages.jsx';

class Pages extends React.Component{
   
    
    render(){

        return (
            <div>
                <div className="content">
                    <Row>
                        <Col xs={12} md={12}>

                    <div className="page-title">
                        <div className="float-left">
                            <h1 className="title">NOTICIAS</h1>
                        </div>
                    </div>
    
                    <div className="col-12">
                        <section className="box ">
                            {/* <header className="panel_header">
                                <h2 className="title float-left">Últimas noticias</h2>
                            </header> */}
                            <div className="content-body">    

                                <PagePosts pages={pages} />

                            </div>
                        </section>
                    </div>
                                
                        </Col>

                    </Row>
                </div>
            </div>
        );
    }
}

export default Pages;
