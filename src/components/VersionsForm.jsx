import React from 'react';
import ChapterSelect from './ChapterSelect.jsx';
import ChapterText from './ChapterText.jsx';
import SearchForm from './SearchForm.jsx';
import SearchData from './SearchData.jsx';
const $ = require('jquery');


class VersionsForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      bibles: [],
      version: null,
      books: [],
      chapters: null,
      chapterText: null,
      chapterInfo: null,
      searchData: []
    }
  }

  componentDidMount() {
    //get bible versions list from biblia api
    // $.get({
    //   url: '/bibleForm',
    //   error: (err) => {
    //     console.log('mount', err)
    //   },
    //   success: (data) => {
    //     console.log(data);
    //     this.setState({
    //       bibles: data[0].bibles,
    //       books: data[1].data,
    //     });
    //   }
    // })
    $.get({
      url: '/bibleForm'
    })
    .then((data) => {
      this.setState({
        bibles: data[0].bibles,
        books: data[1].data,
      })
    })
    .catch(err => alert(err));
  }

  onVersionSubmit (event) {
    event.preventDefault();
    $('#chapter-select').toggle();
    let versionValue = $('#versions').val();
    let bookValue = $('#books').val();

    let versionAbbrv = this.getAbbrv(this.state.bibles, versionValue, 'title', 'bible');
    let bookAbbrv = this.getAbbrv(this.state.books, bookValue, 'name', 'id');

    for (let bookObj of this.state.books) {
      if (bookObj['id'] === bookAbbrv) {
        let chaptersObj = {
          version: versionAbbrv,
          book: [bookValue, bookAbbrv],
          chapters: bookObj['chapters'].slice(1)
        }
        this.setState({
          chapters: chaptersObj
        })
      }
    }
  }

  onChapterSelect (chapObj, chapNum, toggle) {
    if (toggle) {
      $('#chapter-select').toggle(500);
    }
    $('#search-data').hide(500);
    $('#text').show();
    window.scrollTo(0,0);
    this.setState({
      chapterInfo: [chapObj, chapNum]
    });
    // $.get({
    //   url: `/chapter/${chapObj.version}/${chapObj.book[1]}/${chapNum}`,
    //   dataType: 'html',
    //   err: (err) => {
    //     console.log(err)
    //   },
    //   success: (data) => {
    //     this.setState({
    //       chapterText: data
    //     })
    //   }
    // });
    $.get({
      url: `/chapter/${chapObj.version}/${chapObj.book[1]}/${chapNum}`,
      dataType: 'html'
    })
    .then((data) => {
      this.setState({
        chapterText: data
      })
    })
    .catch(err => {alert(err)});
  }

  onSearch (event, query, book) {
    //make api request to server at /api/search
    event.preventDefault();

    //animations and ui manipulation
    $('#chapter-select').hide(500);
    $('#text').hide(500);
    $('#search-data').slideToggle(500);


    let processedQuery = query.split(' ').join('%20');
    let version = $('#versions').val();
    let versionAbbrv = this.getAbbrv(this.state.bibles, version, 'title', 'bible');

    //build url based on chapter/version
    // let url;
    // if (book) {
    //   url = `/search/${versionAbbrv}/${processedQuery}/${book}`
    // }

    // $.get({
    //   url: `/search/${versionAbbrv}/${processedQuery}/${book}`,
    //   dataType: 'json',
    //   err: (err) => {
    //     console.log(err)
    //   },
    //   success: (data) => {
    //     console.log(data.results);
    //     if (data.length === 0) {
    //       alert('Sorry, no results');
    //     }
    //     this.setState({
    //       searchData: data.results
    //     })
    //     $('#search-data').show(500);
    //   }
    // })
    $.get({
      url: `/search/${versionAbbrv}/${processedQuery}/${book}`,
      dataType: 'json'
    })
    .then((data) => {
      if (data.length === 0) {
        alert('Sorry, no results')
        $('#chapter-select').show(500);
      }
      this.setState({
        searchData: data.results
      })
      $('#search-data').show(500);
    })
    .catch(err =>{alert(err)});
  }

  //returns abbrv value for book name or version name
  getAbbrv (data, value, key1, key2) {
    for (let obj of data) {
      if (obj[key1] === value) {
        return obj[key2]
      }
    }
  }

  render() {
    //conditional rendering for chapters grid
    let chapterSelect;
    if (this.state.chapters) {
      chapterSelect = <ChapterSelect
      chaptersObj={this.state.chapters}
      onChapterSelect={this.onChapterSelect.bind(this)}
      onSearch={this.onSearch.bind(this)}/>
    } else {
      chapterSelect = <div></div>
    }

    return (
      <div>
        <div className="form-container">
          <form className ="form-item" id="form" onSubmit={()=>{this.onVersionSubmit(event)}}>
          <label>Select A Translation</label><br></br>
          <select id="versions">
            {this.state.bibles.map((bibleObj, index)=> {
              return <option id={bibleObj.abbreviatedTitle} key={index}>{bibleObj.title}</option>
            })}
          </select><br></br>

          <label>Select A Book</label><br></br>
          <select id="books">
            {this.state.books.map((bookObj, index)=> {
              return <option id={bookObj.id} key={index}>{bookObj.name}</option>
            })}
          </select><br></br>

          <button type="submit">Show Chapters</button>
          </form>
          <SearchForm onSubmit={this.onSearch.bind(this)}/><br></br>
        </div>
        {chapterSelect}
        <SearchData data={this.state.searchData}/>
        <ChapterText
          navClick={this.onChapterSelect.bind(this)}
          chapterInfo={this.state.chapterInfo}
          text={this.state.chapterText}/>
      </div>
    )
  }
}

export default VersionsForm;
