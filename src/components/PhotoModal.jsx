/**
 *
 * //photo/1?modal=true
 */

import React, { PropTypes } from "react/addons";
import { Link } from 'react-router';
import Photo from './Photo.jsx';
import PhotoNavLink from './PhotoNavLink.jsx';
import CloseSvg from './svg/CloseSvg.jsx';
import PhotoStore from '../stores/PhotoStore';
import BodyClass from '../utils/BodyClass';
import PageActionCreators from '../actions/PageActionCreators';
import classNames from 'classnames';
import addDocumentKeyBoardSupport from '../utils/addDocumentKeyBoardSupport';
import Debug from 'debug';

const { addons } = React;
const { CSSTransitionGroup } = addons;

const debug = Debug('-------  PhotoModal.jsx: ');

//right now I can't see a good way to invoke methods of the DecoratedComponent
//@addDocumentKeyBoardSupport()
class PhotoModal extends React.Component {

  static contextTypes = {
    router: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    getStore: React.PropTypes.func.isRequired
  }

  static propTypes = {
    photoId: React.PropTypes.number.isRequired
  }

  constructor(props, context){
    super(props);

    let store = context.getStore(PhotoStore);

    this.context = context;
    this.state = {
      photo: store.get(props.photoId),
      nextId: store.next(props.photoId),
      previousId: store.previous(props.photoId),
      didMount: false,
      direction: null
    }

    this.closeModal = this.closeModal.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const store = this.context.getStore(PhotoStore);
    let direction;

    if((nextProps.photoId > this.props.photoId && !(this.props.photoId == 1 && nextProps.photoId == store.getLength())) || (this.props.photoId == store.getLength() && nextProps.photoId == 1)){
      direction = 'next';

      this.setState({
        photo: store.get(nextProps.photoId),
        nextId: store.next(nextProps.photoId),
        previousId: store.previous(nextProps.photoId),
        direction: direction
      })
    }else{
      direction = 'previous';

      if(this.props.photoId != nextProps.photoId){
        this.setState({
          photo: store.get(nextProps.photoId),
          nextId: store.next(nextProps.photoId),
          previousId: store.previous(nextProps.photoId),
          direction: direction
        })
      }
    }
  }

  componentDidMount(){
    document.addEventListener('keydown', this.onKeyDown);

    this.setState({
      didMount: true
    })
  }

  componentWillUMount(){
    document.removeEventListener('keydown', this.onKeyDown);
  }

  render() {
    let cls = classNames({
      'animated': this.state.didMount,
      'modal-visible': this.state.didMount
    })

    return (
      <BodyClass className={'photo-modal-page'}>
        <div id='photo-modal' className={cls} onClick={this.closeModal} >
          <div id='photo-modal-backdrop'></div>
          <div id='photo-wrap'>
            <div className={this.state.direction}>
              <CSSTransitionGroup component="div" transitionName="example">
                <Photo photo={this.state.photo} key={this.state.photo.id}/>
              </CSSTransitionGroup>
            </div>
            <div id='photo-content'>
              <figure id='photo-figure'></figure>
            </div>
          </div>
          <Link to="home" id="close-photo">
            <CloseSvg/>
          </Link>
          <PhotoNavLink direction='previous' id={this.state.previousId}/>
          <PhotoNavLink direction='next' id={this.state.nextId}/>
        </div>
      </BodyClass>
    );
  }

  onKeyDown(e){
    switch(e.keyCode){
      case 27: //esc
        this.closeModal(null);
      break;
      case 37: //left
        this.context.router.transitionTo('photo', {id: this.state.previousId },  {modal: true});
      break;
      case 39: //right
        this.context.router.transitionTo('photo', {id: this.state.nextId },  {modal: true});
      break;
    }
  }

  closeModal(e){

    if(e){
      e.preventDefault();
      e.stopPropagation();
    }

    this.context.router.transitionTo('home');
  }

};

module.exports = PhotoModal;
