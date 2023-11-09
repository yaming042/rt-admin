import {Link} from 'react-router-dom';

export default () => {
    return (
        <>
            {location.pathname}<br/>
            <Link to="/test1">test1</Link><br/>
            <Link to="/test2">test2</Link><br/>
            <Link to="/test3">test3</Link><br/>
            <Link to="/test4">test4</Link><br/>
            <Link to="/test5">test5</Link><br/>
            <Link to="/login">login</Link><br/>
        </>
    );
}