import * as ko from "knockout";
import { registerAdorner } from "../surveyjsObjects";
import { editorLocalization } from "../editorLocalization";
import Sortable from "sortablejs";

import "./title-editor.scss";
var templateHtml = require("html-loader?interpolate!val-loader!./title-editor.html");

export class TitleInplaceEditor {
  editingName = ko.observable<string>();
  prevName = ko.observable<string>();
  isEditing = ko.observable<boolean>(false);

  protected forNeibours(func: (el: HTMLElement) => void) {
    var holder = this.rootElement.parentElement.parentElement;
    for (var i = 0; i < holder.children.length - 1; i++) {
      var element = holder.children[i];
      func(element);
    }
  }

  constructor(name: string, protected rootElement) {
    this.editingName(name);
    this.prevName(name);
    this.forNeibours(
      element =>
        (element.onclick = e => {
          this.startEdit(this, e);
          e.preventDefault();
        })
    );
  }

  valueChanged: (newVal: any) => void;

  public getLocString(str: string) {
    return editorLocalization.getString(str);
  }

  hideEditor = () => {
    this.isEditing(false);
    this.forNeibours(element => (element.style.display = ""));
  };
  startEdit = (model, event) => {
    this.editingName(this.prevName());
    this.isEditing(true);
    this.forNeibours(element => (element.style.display = "none"));
    this.rootElement.getElementsByTagName("input")[0].focus();
  };
  postEdit = () => {
    if (this.prevName() !== this.editingName()) {
      this.prevName(this.editingName());
      !!this.valueChanged && this.valueChanged(this.editingName());
    }
    this.hideEditor();
  };
  cancelEdit = () => {
    this.editingName(this.prevName());
    this.hideEditor();
  };
  nameEditorKeypress = (model, event) => {
    if (event.keyCode === 13) {
      this.postEdit();
    } else if (event.keyCode === 27) {
      this.cancelEdit();
    }
  };
}

ko.components.register("title-editor", {
  viewModel: {
    createViewModel: (params, componentInfo) => {
      var model = new TitleInplaceEditor(
        params.model[params.name],
        componentInfo.element
      );
      model.valueChanged = newValue => (params.model[params.name] = newValue);
      return model;
    }
  },
  template: templateHtml
});

export var titleAdorner = {
  getMarkerClass: model => {
    return "title_editable";
  },
  afterRender: (elements: HTMLElement[], model) => {
    var decoration = document.createElement("span");
    decoration.innerHTML =
      "<title-editor params='name: \"title\", model: $data'></title-editor>";
    elements[0].appendChild(decoration);
    ko.applyBindings(model, decoration);
  }
};

registerAdorner("title", titleAdorner);
