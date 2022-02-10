import React, { useRef, useState, useEffect } from 'react';
import plus from '../assets/plus-circle-solid.svg';
import '../App.css';
import Item from './Item';
import { addDoc, collection, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useAuth } from '../context/AuthContext';
import Calendar from 'react-calendar';

export default function Overlay() {
	const [overlayContainerState, setOverlayContainerState] = useState('closed');
	const [field, setField] = useState('info');
	const [addState, setAddState] = useState('add');

	const [calendar, setCalender] = useState('');
	const [date, setDate] = useState(new Date());
	const [items, setItems] = useState([{ id: 0, name: '', quantity: '', price: '' }]);

	const [formData, setFormData] = useState({
		client: '',
		'client-email': '',
		'client-street': '',
		'client-city': '',
		'client-postcode': '',
		'client-country': '',
		createdAt: serverTimestamp(),
		status: 'Pending',
		items: [],
		total: 0,
	});

	const plusBtn = useRef();
	const cancelBtn = useRef();
	const overlay = useRef();

	const { currentUser } = useAuth();

	// const currentDate = new Date().toLocaleString('en-GB', {
	// 	month: 'long',
	// 	day: 'numeric',
	// 	year: 'numeric',
	// });

	// const [invoiceDate, setInvoiceDate] = useState(currentDate);

	// User Input fields
	const senderCompany = useRef();
	const senderStreet = useRef();
	const senderCity = useRef();
	const senderPostcode = useRef();
	const senderCountry = useRef();
	const clientClient = useRef();
	const clientEmail = useRef();
	const clientStreet = useRef();
	const clientCity = useRef();
	const clientPostcode = useRef();
	const clientCountry = useRef();
	// const invoiceDate = useRef();
	const paymentExpected = useRef();
	const jobDescription = useRef();

	const handleClick = () => {
		if (overlayContainerState === 'closed') {
			setOverlayContainerState('open');
			setItems([{ id: 0, name: '', quantity: '', price: '' }]);
		} else {
			setOverlayContainerState('closed');
			setItems([]);
			setTimeout(() => setField('info'), 500);
			clientClient.current.setAttribute('placeholder', '');
			setAddState('add');
			clearAllInputs();
		}
	};

	const changeField = () => {
		field === 'info' ? setField('items') : setField('info');
		setAddState('add');
	};

	const removeItem = (id) => {
		setItems((items) => {
			return items.filter((item) => item.id !== id);
		});
	};

	const addNewItem = () => {
		setItems((items) => [
			...items,
			{ id: items.slice(-1)[0] ? items.slice(-1)[0].id + 1 : 0, name: '', quantity: '', price: '' },
		]);
		// getItems();
	};

	const getItems = () => {
		const allItems = document.querySelectorAll('.item');
		let items = [];
		allItems.forEach((item) => {
			if (
				item.children[1].firstChild.value &&
				item.children[2].firstChild.value &&
				item.children[3].firstChild.firstChild.value
			) {
				items.push({
					name: item.children[0].firstChild.value,
					quantity: item.children[1].firstChild.value,
					price: item.children[2].firstChild.value,
					total: item.children[3].firstChild.firstChild.value,
				});
			}
		});
		return items;
	};

	const addNewInvoice = async () => {
		let sumTotal = 0;
		const currentItems = getItems();
		currentItems.forEach((item) => {
			if (item.total) {
				sumTotal += Number(item.total);
			}
		});

		if (clientClient.current.value && sumTotal) {
			setFormData({ ...formData, items: [...currentItems], total: sumTotal });
			await addDoc(collection(db, 'users', currentUser.email, 'Invoices'), {
				...formData,
			});

			// Reset
			setOverlayContainerState('closed');
			setItems([{ id: 0 }]);
			setTimeout(() => setField('info'), 500);
			setItems([]);
			clientClient.current.setAttribute('placeholder', '');
			setAddState('add');
			clearAllInputs();
		} else if (clientClient.current.value && !sumTotal) {
			setAddState('add-error');
		} else if (!clientClient.current.value && sumTotal) {
			clientClient.current.setAttribute('placeholder', 'Please add client');
		} else {
			clientClient.current.setAttribute('placeholder', 'Please add client');
			setAddState('add-error');
		}
	};

	const addInfo = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const downloadPdf = () => {
		console.log(formData);
		// clearAllInputs();
	};

	const clearAllInputs = () => {
		const allInputs = document.querySelectorAll('.new-invoice-input');
		allInputs.forEach((input) => {
			input.value = '';
		});
	};

	const calenderOff = (clickedDate) => {
		setCalender('');
		setDate(clickedDate);
		setFormData({ ...formData, createdAt: clickedDate });
	};

	const toggleCalendar = () => {
		calendar === ''
			? setCalender(<Calendar onChange={setDate} onClickDay={(e) => calenderOff(e)} />)
			: setCalender('');
	};

	return (
		<section className={`overlay-container ${overlayContainerState}`}>
			<article ref={plusBtn} onClick={handleClick} className={`icon-container`}>
				<button ref={cancelBtn} onClick={handleClick} className='btn cancel-btn'>
					Cancel
				</button>
				<img className='logo' src={plus} alt='' />
			</article>
			<article ref={overlay} className={`overlay`}>
				{/* <h1 className='overlay-title'>New Invoice</h1> */}
				<div className={`overlay-fields ${field}`}>
					{/* ITEMS */}
					<fieldset style={{ outline: 'none', border: 'none' }} className='new-invoice'>
						<form action='' className='new-invoice-item-form'>
							<h4 className='input-title items'>Items:</h4>
							<div className='items-list'>
								<div className='items-titles'>
									<div className='item-attribute'>
										<h2 className='item-attribute'>Name</h2>
									</div>
									<div className='item-attribute'>
										<h2 className='item-attribute'>Qty</h2>
									</div>
									<div className='item-attribute'>
										<h2 className='item-attribute'>Price</h2>
									</div>
									<div className='item-attribute'>
										<h2 className='item-attribute'>Total</h2>
									</div>
								</div>
								{items.map((item) => {
									return (
										<Item
											key={item.id}
											id={item.id}
											name={item.name}
											price={item.price}
											quantity={item.quantity}
											removeItem={removeItem}
										/>
									);
								})}
							</div>
							<div onClick={() => addNewItem()} className='add-items'>
								+ Add New Item
							</div>
							<div onClick={() => changeField()} className='add-items'>
								Back
							</div>
						</form>
					</fieldset>
					{/* INFORMATION */}
					<fieldset style={{ outline: 'none', border: 'none' }} className='new-invoice'>
						<form className='new-invoice-input-form'>
							{/* SENDER DETAILS */}
							<div className='invoice-from'>
								<h4 className='input-title'>Invoice From:</h4>
								<div className='company'>
									<h2 className='item-attribute'>Company</h2>
									<input ref={senderCompany} className='new-invoice-input' type='text' />
								</div>
								<div className='street'>
									<h2 className='item-attribute'>Street</h2>
									<input ref={senderStreet} className='new-invoice-input' type='text' />
								</div>
								<div className='city'>
									<h2 className='item-attribute'>City</h2>
									<input ref={senderCity} className='new-invoice-input' type='text' />
								</div>
								<div className='postcode'>
									<h2 className='item-attribute'>Postcode</h2>
									<input ref={senderPostcode} className='new-invoice-input' type='text' />
								</div>
								<div className='country'>
									<h2 className='item-attribute'>Country</h2>
									<input ref={senderCountry} className='new-invoice-input' type='text' />
								</div>
							</div>
							{/* CLIENT DETAILS */}
							<h4 className='input-title'>Invoice To:</h4>
							<div className='client'>
								<h2 className='item-attribute'>Client</h2>
								<input
									ref={clientClient}
									onChange={addInfo}
									name='client'
									type='text'
									className='new-invoice-input'
								/>
							</div>
							<div className='email'>
								<h2 className='item-attribute'>Email</h2>
								<input
									ref={clientEmail}
									onChange={addInfo}
									name='client-email'
									type='email'
									className='new-invoice-input'
								/>
							</div>
							<div className='client-street'>
								<h2 className='item-attribute'>Street</h2>
								<input
									ref={clientStreet}
									onChange={addInfo}
									name='client-street'
									type='text'
									className='new-invoice-input'
								/>
							</div>
							<div className='client-city'>
								<h2 className='item-attribute'>City</h2>
								<input
									ref={clientCity}
									onChange={addInfo}
									name='client-city'
									type='text'
									className='new-invoice-input'
								/>
							</div>
							<div className='client-postcode'>
								<h2 className='item-attribute'>Postcode</h2>
								<input
									ref={clientPostcode}
									onChange={addInfo}
									name='client-postcode'
									type='text'
									className='new-invoice-input'
								/>
							</div>
							<div className='client-country'>
								<h2 className='item-attribute'>Country</h2>
								<input
									ref={clientCountry}
									onChange={addInfo}
									name='client-country'
									type='text'
									className='new-invoice-input'
								/>
							</div>
							<br />
							<div className='invoice-date'>
								<h2 className='item-attribute'>Invoice Date</h2>
								<input
									type='text'
									onClick={toggleCalendar}
									// ref={invoiceDate}
									onChange={addInfo}
									name='createdAt'
									style={{ border: 'none' }}
									// disabled={true}
									value={date.toLocaleString('en-GB', {
										month: 'long',
										day: 'numeric',
										year: 'numeric',
									})}
									className='new-invoice-input'
								/>
								{calendar}
							</div>
							<div className='payment-expected'>
								<h2 className='item-attribute'>Payment Expected</h2>
								<input ref={paymentExpected} type='text' className='new-invoice-input' />
							</div>
							<div className='job-description'>
								<h2 className='item-attribute'>Job Description</h2>
								<input ref={jobDescription} type='text' className='new-invoice-input' />
							</div>
							<div onClick={() => changeField()} className={`add-items ${addState}`}>
								+ Add Items
							</div>
							<div onClick={addNewInvoice} className='add-items save'>
								Save
							</div>
							<div onClick={downloadPdf} className='add-items download-pdf'>
								Download PDF
							</div>
						</form>
					</fieldset>
				</div>
			</article>
		</section>
	);
}
