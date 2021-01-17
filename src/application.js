import 'bootstrap/dist/css/bootstrap-grid.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export default () => {
  const wrapper = document.createElement('div');
  wrapper.classList.add('input-group', 'mb-3');
  const input = document.createElement('input');
  input.classList.add('form-control');
  input.setAttribute('type', 'text');
  const buttonWrapper = document.createElement('div');
  buttonWrapper.classList.add('input-group-append');
  const button = document.createElement('button');
  button.classList.add('btn', 'btn-outline-primary');
  button.textContent = 'Add';
  buttonWrapper.appendChild(button);
  wrapper.append(input, button);
  document.body.appendChild(wrapper);
}