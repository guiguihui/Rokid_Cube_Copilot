// Vendored rubiks-cube-solver 1.2.0 (https://github.com/git-leon/rubiks-cube-solver, MIT)
// CFOP/Fridrich, table-free, ~15ms, no heavy precompute. Adapted UMD->ES module for AIUI/Ink sandbox.
const __g = {};
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["rubiksCubeSolver"] = factory();
	else
		root["rubiksCubeSolver"] = factory();
})(__g, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 33);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_gl_vec3_cross__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_gl_vec3_cross___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_gl_vec3_cross__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__models_Face__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__models_Vector__ = __webpack_require__(4);




// maps each face with the notation for their middle moves
const _middlesMatchingFace = {
	f: 's',
	r: 'mprime',
	u: 'eprime',
	d: 'e',
	l: 'm',
	b: 'sprime'
};

/**
 * @param {string} move - The notation of a move, e.g. rPrime.
 * @return {string}
 */
const getFaceOfMove = (move) => {
	if (typeof move !== 'string') {
		throw new TypeError('move must be a string');
	}

	let faceLetter = move[0].toLowerCase();

	if (faceLetter === 'f') return 'front';
	if (faceLetter === 'r') return 'right';
	if (faceLetter === 'u') return 'up';
	if (faceLetter === 'd') return 'down';
	if (faceLetter === 'l') return 'left';
	if (faceLetter === 'b') return 'back';
};
/* harmony export (immutable) */ __webpack_exports__["a"] = getFaceOfMove;


/**
 * Almost useless. Almost.
 * @param {string} face - The string identifying a face.
 * @return {string}
 */
const getMoveOfFace = (face) => {
	if (typeof face !== 'string') {
		throw new TypeError('face must be a string');
	}

	face = face.toLowerCase();

	if (!['front', 'right', 'up', 'down', 'left', 'back'].includes(face)) {
		throw new Error(`${face} is not valid face`);
	}

	return face[0];
};
/* harmony export (immutable) */ __webpack_exports__["f"] = getMoveOfFace;


const getMiddleMatchingFace = (face) => {
	face = face.toLowerCase()[0];
	return _middlesMatchingFace[face];
};
/* harmony export (immutable) */ __webpack_exports__["g"] = getMiddleMatchingFace;


const getFaceMatchingMiddle = (middle) => {
	middle = middle.toLowerCase();

	for (let face of Object.keys(_middlesMatchingFace)) {
		let testMiddle = _middlesMatchingFace[face];
		if (middle === testMiddle) {
			return face;
		}
	}
};
/* unused harmony export getFaceMatchingMiddle */


/**
 * @param {string|array} notations - The move notation.
 * @param {object} options - Move options.
 * @prop {boolean} options.upperCase - Turn all moves to upper case (i.e. no "double" moves).
 *
 * @return {string|array} -- whichever was initially given.
 */
const transformNotations = (notations, options = {}) => {
	let normalized = normalizeNotations(notations);

	if (options.upperCase) {
		normalized = normalized.map(n => n[0].toUpperCase() + n.slice(1));
	}

	if (options.orientation) {
		normalized = orientMoves(normalized, options.orientation);
	}

	if (options.reverse) {
		normalized = _reverseNotations(normalized);
	}

	return typeof notations === 'string' ? normalized.join(' ') : normalized;
};
/* harmony export (immutable) */ __webpack_exports__["d"] = transformNotations;


/**
 * @param {array|string} notations - The notations to noramlize.
 * @return {array}
 */
const normalizeNotations = (notations) => {
	if (typeof notations === 'string') {
		notations = notations.split(' ');
	}

	notations = notations.filter(notation => notation !== '');

	return notations.map(notation => {
		let isPrime = notation.toLowerCase().includes('prime');
		let isDouble = notation.includes('2');

		notation = notation[0];

		if (isDouble) notation = notation[0] + '2';
		else if (isPrime) notation = notation + 'prime';

		return notation;
	});
};
/* harmony export (immutable) */ __webpack_exports__["h"] = normalizeNotations;


/**
 * Finds the direction from an origin face to a target face. The origin face
 * will be oriented so that it becomes FRONT. An orientation object must be
 * provided that specifies any of these faces (exclusively): TOP, RIGHT, DOWN,
 * LEFT.
 * If FRONT or BACK is provided along with one of those faces, it will be
 * ignored. If FRONT or BACK is the only face provided, the orientation is
 * ambiguous and an error will be thrown.
 *
 * Example:
 * getDirectionFromFaces('back', 'up', { down: 'right' })
 * Step 1) orient the BACK face so that it becomes FRONT.
 * Step 2) orient the DOWN face so that it becomes RIGHT.
 * Step 3) Find the direction from BACK (now FRONT) to UP (now LEFT).
 * Step 4) Returns 'left'.
 *
 * @param {string} origin - The origin face.
 * @param {string} target - The target face.
 * @param {object} orientation - The object that specifies the cube orientation.
 * @return {string|number}
 */
const getDirectionFromFaces = (origin, target, orientation) => {
	orientation = _toLowerCase(orientation);
	orientation = _prepOrientationForDirection(orientation, origin);

	let fromFace = new __WEBPACK_IMPORTED_MODULE_1__models_Face__["a" /* Face */](origin);
	let toFace = new __WEBPACK_IMPORTED_MODULE_1__models_Face__["a" /* Face */](target);

	let rotations = _getRotationsForOrientation(orientation);
	_rotateFacesByRotations([fromFace, toFace], rotations);

	let axis = new __WEBPACK_IMPORTED_MODULE_2__models_Vector__["a" /* Vector */](__WEBPACK_IMPORTED_MODULE_0_gl_vec3_cross___default()([], fromFace.normal(), toFace.normal())).getAxis();
	let direction = __WEBPACK_IMPORTED_MODULE_2__models_Vector__["a" /* Vector */].getAngle(fromFace.normal(), toFace.normal());

	if (axis === 'x' && direction > 0) return 'down';
	if (axis === 'x' && direction < 0) return 'up';
	if (axis === 'y' && direction > 0) return 'right';
	if (axis === 'y' && direction < 0) return 'left';

	if (direction === 0) {
		return 'front';
	} else if (direction === Math.PI) {
		return 'back';
	}
};
/* harmony export (immutable) */ __webpack_exports__["c"] = getDirectionFromFaces;


/**
 * See `getDirectionFromFaces`. Almost identical, but instead of finding a
 * direction from an origin face and target face, this finds a target face from
 * an origin face and direction.
 * @param {string} origin - The origin face.
 * @param {string} direction - The direction.
 * @param {object} orientation - The orientation object.
 * @return {string}
 */
const getFaceFromDirection = (origin, direction, orientation) => {
	orientation = _toLowerCase(orientation);
	orientation = _prepOrientationForDirection(orientation, origin);

	let fromFace = new __WEBPACK_IMPORTED_MODULE_1__models_Face__["a" /* Face */](origin);

	let rotations = _getRotationsForOrientation(orientation);
	_rotateFacesByRotations([fromFace], rotations);

	let directionFace = new __WEBPACK_IMPORTED_MODULE_1__models_Face__["a" /* Face */](direction);
	let { axis, angle } = __WEBPACK_IMPORTED_MODULE_2__models_Vector__["a" /* Vector */].getRotationFromNormals(fromFace.normal(), directionFace.normal());
	fromFace.rotate(axis, angle);

	// at this point fromFace is now the target face, but we still need to revert
	// the orientation to return the correct string
	let reversedRotations = rotations.map(rotation => __WEBPACK_IMPORTED_MODULE_2__models_Vector__["a" /* Vector */].reverseRotation(rotation)).reverse();
	_rotateFacesByRotations([fromFace], reversedRotations);
	return fromFace.toString();
};
/* harmony export (immutable) */ __webpack_exports__["e"] = getFaceFromDirection;


/**
 * Finds a move that rotates the given face around its normal, by the angle
 * described by normal1 -> normal2.
 * @param {string} face - The face to rotate.
 * @param {string} from - The origin face.
 * @param {string} to - The target face.
 * @return {string}
 */
const getRotationFromTo = (face, from, to) => {
	const rotationFace = new __WEBPACK_IMPORTED_MODULE_1__models_Face__["a" /* Face */](face);
	const fromFace = new __WEBPACK_IMPORTED_MODULE_1__models_Face__["a" /* Face */](from);
	const toFace = new __WEBPACK_IMPORTED_MODULE_1__models_Face__["a" /* Face */](to);

	let rotationAxis = rotationFace.vector.getAxis();
	let [fromAxis, toAxis] = [fromFace.vector.getAxis(), toFace.vector.getAxis()];

	if ([fromAxis.toLowerCase(), toAxis.toLowerCase()].includes(rotationAxis.toLowerCase())) {
		throw new Error(`moving ${rotationFace} from ${fromFace} to ${toFace} is not possible.`);
	}

	let move = getMoveOfFace(face).toUpperCase();
	let angle = __WEBPACK_IMPORTED_MODULE_2__models_Vector__["a" /* Vector */].getAngle(fromFace.normal(), toFace.normal());
	if (rotationFace.vector.getMagnitude() < 0) {
		angle *= -1;
	}

	if (angle === 0) {
		return '';
	} else if (Math.abs(angle) === Math.PI) {
		return `${move} ${move}`;
	} else if (angle < 0) {
		return `${move}`;
	} else if (angle > 0) {
		return `${move}Prime`;
	}
};
/* harmony export (immutable) */ __webpack_exports__["b"] = getRotationFromTo;


/**
 * Returns an array of transformed notations so that if done when the cube's
 * orientation is default (FRONT face is FRONT, RIGHT face is RIGHT, etc.), the
 * moves will have the same effect as performing the given notations on a cube
 * oriented by the specified orientation.
 *
 * Examples:
 * orientMoves(['R', 'U'], { front: 'front', up: 'up' })      === ['R', 'U']
 * orientMoves(['R', 'U'], { front: 'front', down: 'right' }) === ['U', 'L']
 * orientMoves(['R', 'U', 'LPrime', 'D'], { up: 'back', right: 'down' }) === ['D', 'B', 'UPrime', 'F']
 *
 * @param {array} notations - An array of notation strings.
 * @param {object} orientation - The orientation object.
 */
const orientMoves = (notations, orientation) => {
	orientation = _toLowerCase(orientation);
	let rotations = _getRotationsForOrientation(orientation);
	rotations.reverse().map(rotation => __WEBPACK_IMPORTED_MODULE_2__models_Vector__["a" /* Vector */].reverseRotation(rotation));

	return notations.map(notation => {
		let isPrime = notation.toLowerCase().includes('prime');
		let isDouble = notation.includes('2');
		let isWithMiddle = notation[0] === notation[0].toLowerCase();
		let isMiddle = ['m', 'e', 's'].includes(notation[0].toLowerCase());

		if (isDouble) {
			notation = notation.replace('2', '');
		}

		let face;

		if (isMiddle) {
			let faceStr = getFaceOfMove(getFaceMatchingMiddle(notation));
			face = new __WEBPACK_IMPORTED_MODULE_1__models_Face__["a" /* Face */](faceStr);
		} else {
			let faceStr = getFaceOfMove(notation[0]);
			face = new __WEBPACK_IMPORTED_MODULE_1__models_Face__["a" /* Face */](faceStr);
		}

		_rotateFacesByRotations([face], rotations);

		let newNotation; // this will always be lower case

		if (isMiddle) {
			newNotation = getMiddleMatchingFace(face.toString());
		} else {
			newNotation = face.toString()[0];
		}

		if (!isWithMiddle) newNotation = newNotation.toUpperCase();
		if (isDouble) newNotation = newNotation + '2';
		if (isPrime && !isMiddle) newNotation += 'prime';

		return newNotation;
	});
};
/* unused harmony export orientMoves */


//-----------------
// Helper functions
//-----------------

/**
 * Returns an object with all keys and values lowercased. Assumes all keys and
 * values are strings.
 * @param {object} object - The object to map.
 */
function _toLowerCase(object) {
	let ret = {};
	Object.keys(object).forEach(key => {
		ret[key.toLowerCase()] = object[key].toLowerCase();
	});
	return ret;
}

/**
 * This function is specificly for `getDirectionFromFaces` and
 * `getFaceFromDirection`. It removes all keys that are either 'front' or 'back'
 * and sets the given front face to orientation.front.
 * @param {object} orientation - The orientation object.
 * @param {string} front - The face to set as front.
 */
function _prepOrientationForDirection(orientation, front) {
	let keys = Object.keys(orientation);

	if (keys.length <= 1 && ['front', 'back'].includes(keys[0])) {
		throw new Error(`Orientation object "${orientation}" is ambiguous. Please specify one of these faces: "up", "right", "down", "left"`);
	}

	// remove "front" and "back" from provided orientation object
	let temp = orientation;
	orientation = {};

	keys.forEach(key => {
		if (['front', 'back'].includes(key)) {
			return;
		}
		orientation[key] = temp[key];
	});

	orientation.front = front.toLowerCase();

	return orientation;
}

/**
 * @param {object} orientation - The orientation object.
 * @return {array}
 */
function _getRotationsForOrientation(orientation) {
	if (Object.keys(orientation) <= 1) {
		throw new Error(`Orientation object "${orientation}" is ambiguous. Please specify 2 faces.`);
	}

	let keys = Object.keys(orientation);
	let origins = keys.map(key => new __WEBPACK_IMPORTED_MODULE_1__models_Face__["a" /* Face */](orientation[key]));
	let targets = keys.map(key => new __WEBPACK_IMPORTED_MODULE_1__models_Face__["a" /* Face */](key));

	// perform the first rotation, and save it
	let rotation1 = __WEBPACK_IMPORTED_MODULE_2__models_Vector__["a" /* Vector */].getRotationFromNormals(
		origins[0].normal(),
		origins[0].orientTo(targets[0]).normal()
	);

	// perform the first rotation on the second origin face
	origins[1].rotate(rotation1.axis, rotation1.angle);

	// peform the second rotation, and save it
	let rotation2 = __WEBPACK_IMPORTED_MODULE_2__models_Vector__["a" /* Vector */].getRotationFromNormals(
		origins[1].normal(),
		origins[1].orientTo(targets[1]).normal()
	);

	// if the rotation angle is PI, there are 3 possible axes that can perform the
	// rotation. however only one axis will perform the rotation while keeping
	// the first origin face on the target. this axis is the same as the origin
	// face's normal.
	if (Math.abs(rotation2.angle) === Math.PI) {
		let rotation2Axis = new __WEBPACK_IMPORTED_MODULE_1__models_Face__["a" /* Face */](keys[0]).vector.getAxis();
		rotation2.axis = rotation2Axis;
	}

	return [rotation1, rotation2];
}

/**
 * @param {array} - Array of Face objects to rotate.
 * @param {array} - Array of rotations to apply to faces.
 * @return {null}
 */
function _rotateFacesByRotations(faces, rotations) {
	for (let face of faces) {
		for (let rotation of rotations) {
			face.rotate(rotation.axis, rotation.angle);
		}
	}
}

/**
 * @param {array} notations
 * @return {array}
 */
function _reverseNotations(notations) {
	const reversed = [];

	for (let notation of notations) {
		let isPrime = notation.includes('prime');
		notation = isPrime ? notation[0] : notation[0] + 'prime';
		reversed.push(notation);
	}

	return typeof moves === 'string' ? reversed.join(' ') : reversed;
}

/* unused harmony default export */ var _unused_webpack_default_export = ({
	getFaceOfMove,
	getMoveOfFace,
	getMiddleMatchingFace,
	getFaceMatchingMiddle,
	transformNotations,
	normalizeNotations,
	getDirectionFromFaces,
	getRotationFromTo,
	getFaceFromDirection,
	orientMoves
});



/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return RubiksCube; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Cubie__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__algorithm_shortener__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils__ = __webpack_require__(0);




const SOLVED_STATE = 'fffffffffrrrrrrrrruuuuuuuuudddddddddlllllllllbbbbbbbbb';

class RubiksCube {
	/**
	 * Factory method. Returns an instance of a solved Rubiks Cube.
	 */
	static Solved() {
		return new RubiksCube(SOLVED_STATE);
	}

	/**
	 * Factory method.
	 * @param {string|array} moves
	 */
	static FromMoves(moves) {
		const cube = RubiksCube.Solved();
		cube.move(moves);
		return cube;
	}

	/**
	 * Factory method. Returns an instance of a scrambled Rubiks Cube.
	 */
	static Scrambled() {
		let cube = RubiksCube.Solved();
		let randomMoves = RubiksCube.getRandomMoves(25);
		cube.move(randomMoves);

		return cube;
	}

	/**
	 * @param {string|array} notations - The list of moves to reverse.
	 * @return {string|array} -- whichever was initially given.
	 */
	static reverseMoves(moves) {
		return RubiksCube.transformMoves(moves, { reverse: true });
	}

	/**
	 * @param {string|array} moves - The moves to transform;
	 * @param {object} options
	 * @prop {boolean} options.upperCase - Turn lowercase moves into uppercase.
	 * @prop {object} options.orientation - An object describing the orientation
	 * from which to makes the moves. See src/js/utils#orientMoves.
	 *
	 * @return {string|array} -- whichever was initially given.
	 */
	static transformMoves(moves, options = {}) {
		return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["d" /* transformNotations */])(moves, options);
	}

	static getRandomMoves(length = 25) {
		let randomMoves = [];
		let totalMoves = [
			'F',
			'Fprime',
			'R',
			'Rprime',
			'U',
			'Uprime',
			'D',
			'Dprime',
			'L',
			'Lprime',
			'B',
			'Bprime'
		];

		while (randomMoves.length < length) {
			for (let i = 0; i < length - randomMoves.length; i++) {
				let idx = ~~(Math.random() * totalMoves.length);
				randomMoves.push(totalMoves[idx]);
			}

			randomMoves = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__algorithm_shortener__["a" /* algorithmShortener */])(randomMoves).split(' ');
		}

		return randomMoves.join(' ');
	}

	/**
	 * @param {string} cubeState - The string representing the Rubik's Cube.
	 *
	 * The cube state are represented as:
	 * 'FFFFFFFFFRRRRRRRRRUUUUUUUUUDDDDDDDDDLLLLLLLLLBBBBBBBBB'
	 *
	 * where:
	 * F stands for the FRONT COLOR
	 * R stands for the RIGHT COLOR
	 * U stands for the UP COLOR
	 * D stands for the DOWN COLOR
	 * L stands for the LEFT COLOR
	 * B stands for the BACK COLOR
	 *
	 * and the faces are given in the order of:
	 * FRONT, RIGHT, UP, DOWN, LEFT, BACK
	 *
	 * The order of each color per face is ordered by starting from the top left
	 * corner and moving to the bottom right, as if reading lines of text.
	 *
	 * See this example: http://2.bp.blogspot.com/_XQ7FznWBAYE/S9Sbric1KNI/AAAAAAAAAFs/wGAb_LcSOwo/s1600/rubik.png
	 */
	constructor(cubeState) {
		if (cubeState.length !== 9 * 6) {
			throw new Error('Wrong number of colors provided');
		}

		this._notationToRotation = {
			f: { axis: 'z', mag: -1 },
			r: { axis: 'x', mag: -1 },
			u: { axis: 'y', mag: -1 },
			d: { axis: 'y', mag: 1 },
			l: { axis: 'x', mag: 1 },
			b: { axis: 'z', mag: 1 },
			m: { axis: 'x', mag: 1 },
			e: { axis: 'y', mag: 1 },
			s: { axis: 'z', mag: -1 }
		};

		this._build(cubeState);
	}

	/**
	 * Grab all the cubes on a given face, and return them in order from top left
	 * to bottom right.
	 * @param {string} face - The face to grab.
	 * @return {array}
	 */
	getFace(face) {
		if (typeof face !== 'string') {
			throw new Error(`"face" must be a string (received: ${face})`);
		}

		face = face.toLowerCase()[0];

		// The 3D position of cubies and the way they're ordered on each face
		// do not play nicely. Below is a shitty way to reconcile the two.
		// The way the cubies are sorted depends on the row and column they
		// occupy on their face. Cubies on a higher row will have a lower sorting
		// index, but rows are not always denoted by cubies' y position, and
		// "higher rows" do not always mean "higher axis values".

		let row, col, rowOrder, colOrder;
		let cubies;

		// grab correct cubies
		if (face === 'f') {
			[row, col, rowOrder, colOrder] = ['Y', 'X', -1, 1];
			cubies = this._cubies.filter(cubie => cubie.getZ() === 1);
		} else if (face === 'r') {
			[row, col, rowOrder, colOrder] = ['Y', 'Z', -1, -1];
			cubies = this._cubies.filter(cubie => cubie.getX() === 1);
		} else if (face === 'u') {
			[row, col, rowOrder, colOrder] = ['Z', 'X', 1, 1];
			cubies = this._cubies.filter(cubie => cubie.getY() === 1);
		} else if (face === 'd') {
			[row, col, rowOrder, colOrder] = ['Z', 'X', -1, 1];
			cubies = this._cubies.filter(cubie => cubie.getY() === -1);
		} else if (face === 'l') {
			[row, col, rowOrder, colOrder] = ['Y', 'Z', -1, 1];
			cubies = this._cubies.filter(cubie => cubie.getX() === -1);
		} else if (face === 'b') {
			[row, col, rowOrder, colOrder] = ['Y', 'X', -1, -1];
			cubies = this._cubies.filter(cubie => cubie.getZ() === -1);
		} else if (['m', 'e', 's'].includes(face)) {
			return this._getMiddleCubiesForMove(face);
		}

		// order cubies from top left to bottom right
		return cubies.sort((first, second) => {
			let firstCubieRow = first[`get${row}`]() * rowOrder;
			let firstCubieCol = first[`get${col}`]() * colOrder;

			let secondCubieRow = second[`get${row}`]() * rowOrder;
			let secondCubieCol = second[`get${col}`]() * colOrder;

			if (firstCubieRow < secondCubieRow) {
				return -1;
			} else if (firstCubieRow > secondCubieRow) {
				return 1;
			} else {
				return firstCubieCol < secondCubieCol ? -1 : 1;
			}
		});
	}

	/**
	 * @param {array} faces - The list of faces the cubie belongs on.
	 */
	getCubie(faces) {
		return this._cubies.find(cubie => {
			if (faces.length != cubie.faces().length) {
				return false;
			}

			for (let face of faces) {
				if (!cubie.faces().includes(face)) {
					return false;
				}
			}

			return true;
		});
	}

	/**
	 * Finds and returns all cubies with three colors.
	 * @return {array}
	 */
	corners() {
		return this._cubies.filter(cubie => cubie.isCorner());
	}

	/**
	 * Finds and returns all cubies with two colors.
	 * @return {array}
	 */
	edges() {
		return this._cubies.filter(cubie => cubie.isEdge());
	}

	/**
	 * Finds and returns all cubies with one color.
	 * @return {array}
	 */
	middles() {
		return this._cubies.filter(cubie => cubie.isMiddle());
	}

	/**
	 * Gets the rotation axis and magnitude of rotation based on notation.
	 * Then finds all cubes on the correct face, and rotates them around the
	 * rotation axis.
	 * @param {string|array} notations - The move notation.
	 * @param {object} options - Move options.
	 * @prop {boolean} options.upperCase - Turn all moves to upper case (i.e. no "double" moves).
	 */
	move(notations, options = {}) {
		if (typeof notations === 'string') {
			notations = notations.split(' ');
		}

		notations = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["d" /* transformNotations */])(notations, options);

		for (let notation of notations) {
			let move = notation[0];

			if (!move) {
				continue;
			}

			let isPrime = notation.toLowerCase().includes('prime');
			let isWithMiddle = move === move.toLowerCase();
			let isDoubleMove  = notation.includes('2');

			let { axis, mag } = this._getRotationForFace(move);
			let cubesToRotate = this.getFace(move);

			if (isPrime) mag *= -1;
			if (isDoubleMove) mag *= 2;

			if (isWithMiddle) {
				let middleMove = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["g" /* getMiddleMatchingFace */])(move);
				let middleCubies = this._getMiddleCubiesForMove(middleMove);
				cubesToRotate = [...cubesToRotate, ...middleCubies];
			}

			for (let cubie of cubesToRotate) {
				cubie.rotate(axis, mag);
			}
		}
	}

	isSolved() {
		return this.toString() === SOLVED_STATE;
	}

	toString() {
		let cubeState = '';

		let faces = ['front', 'right', 'up', 'down', 'left', 'back'];
		for (let face of faces) {
			let cubies = this.getFace(face);
			for (let cubie of cubies) {
				cubeState += cubie.getColorOfFace(face);
			}
		}

		return cubeState;
	}

	clone() {
		return new RubiksCube(this.toString());
	}

	/**
	 * Create a "virtual" cube, with individual "cubies" having a 3D coordinate
	 * position and 1 or more colors attached to them.
	 */
	_build(cubeState) {
		this._cubies = [];
		this._populateCube();

		let parsedColors = this._parseColors(cubeState);

		for (let face of Object.keys(parsedColors)) {
			let colors = parsedColors[face];
			this._colorFace(face, colors);
		}
	}

	/**
	 * Populates the "virtual" cube with 26 "empty" cubies by their position.
	 * @return {null}
	 */
	_populateCube() {
		for (let x = -1; x <= 1; x++) {
			for (let y = -1; y <= 1; y++) {
				for (let z = -1; z <= 1; z++) {
					// no cubie in the center of the rubik's cube
					if (x === 0 && y === 0 && z === 0) {
						continue;
					}

					let cubie = new __WEBPACK_IMPORTED_MODULE_0__Cubie__["a" /* Cubie */]({ position: [x, y, z] });
					this._cubies.push(cubie);
				}
			}
		}
	}

	/**
	 * @return {object} - A map with faces for keys and colors for values
	 */
	_parseColors(cubeState) {
		let faceColors = {
			front: [],
			right: [],
			up: [],
			down: [],
			left: [],
			back: []
		};

		let currentFace;

		for (let i = 0; i < cubeState.length; i++) {
			let color = cubeState[i];

			if (i < 9) {
				currentFace = 'front';
			} else if (i < 9 * 2) {
				currentFace = 'right';
			} else if (i < 9 * 3) {
				currentFace = 'up';
			} else if (i < 9 * 4) {
				currentFace = 'down';
			} else if (i < 9 * 5) {
				currentFace = 'left';
			} else {
				currentFace = 'back';
			}

			faceColors[currentFace].push(color);
		}

		return faceColors;
	}

	/**
	 * @param {array} face - An array of the cubies on the given face.
	 * @param {array} colors - An array of the colors on the given face.
	 */
	_colorFace(face, colors) {
		let cubiesToColor = this.getFace(face);
		for (let i = 0; i < colors.length; i++) {
			cubiesToColor[i].colorFace(face, colors[i]);
		}
	}

	/**
	 * @return {object} - The the rotation axis and magnitude for the given face.
	 */
	_getRotationForFace(face) {
		if (typeof face !== 'string') {
			throw new Error(`"face" must be a string (received: ${face})`);
		}

		face = face.toLowerCase();

		return {
			axis: this._notationToRotation[face].axis,
			mag: this._notationToRotation[face].mag * Math.PI / 2
		};
	}

	_getMiddleCubiesForMove(move) {
		move = move[0].toLowerCase();

		let nonMiddles;
		if (move === 'm') {
			nonMiddles = ['left', 'right'];
		} else if (move === 'e') {
			nonMiddles = ['up', 'down'];
		} else if (move === 's') {
			nonMiddles = ['front', 'back'];
		}

		return this._cubies.filter(cubie => {
			return !cubie.hasFace(nonMiddles[0]) && !cubie.hasFace(nonMiddles[1]);
		});
	}
}




/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return algorithmShortener; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_array_element_combiner__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_array_element_combiner___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_array_element_combiner__);


const parallelMoves = {
	F: 'B',
	R: 'L',
	U: 'D'
};

/**
 * @param {array|string} notations - The array of move notations.
 * @return {string}
 */
const algorithmShortener = (notations) => {
	if (typeof notations === 'string') {
		notations = notations.split(' ');
	}

	const options = {
		compare(a, b) {
			return a[0] === b[0];
		},
		combine(a, b) {
			const aDir = a.includes('2') ? 2 : (a.includes('prime') ? -1 : 1);
			const bDir = b.includes('2') ? 2 : (b.includes('prime') ? -1 : 1);

			let totalDir = aDir + bDir;

			if (totalDir === 4) totalDir = 0;
			if (totalDir === -2) totalDir = 2;
			if (totalDir === 3) totalDir = -1;

			if (totalDir === 0) {
				return '';
			}

			let dirString = totalDir === 2 ? '2' : (totalDir === -1 ? 'prime' : '');

			return `${a[0]}${dirString}`;
		},
		cancel(value) {
			return value === '';
		},
		ignore(a, b) {
			return (parallelMoves[a[0]] === b[0] || parallelMoves[b[0]] === a[0]);
		}
	};

	return __WEBPACK_IMPORTED_MODULE_0_array_element_combiner___default()(notations, options).join(' ');
};




/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return BaseSolver; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__models_RubiksCube__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils___ = __webpack_require__(0);



class BaseSolver {
	/**
	 * Solves the first step following the Fridrich Method: the cross. Solves the
	 * cross on the UP face by default.
	 *
	 * @param {string|RubiksCube} rubiksCube - This can either be a 54-character
	 * long string representing the cube state (in this case it will have to
	 * "build" another rubik's Cube), or an already built RubiksCube object.
	 */
	constructor(rubiksCube, options = {}) {
		this.cube = typeof rubiksCube === 'string' ? new __WEBPACK_IMPORTED_MODULE_0__models_RubiksCube__["a" /* RubiksCube */](rubiksCube) : rubiksCube;
		this.options = options;

		this.partition = {};
		this.partitions = [];
		this.totalMoves = [];
		this._afterEachCallbacks = [];
	}

	/**
	 * @param {string|array} notation - A string of move(s) to execute and store.
	 * @param {object} options - The options to pass to RubiksCube#move.
	 */
	move(notations, options) {
		if (typeof notations === 'string') {
			notations = notations.split(' ');
		}

		this.cube.move(notations, options);

		// this step is also in RubiksCube#move, but it is important we do it here
		// as well. The notations need to be saved to the partition correctly.
		notations = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils___["d" /* transformNotations */])(notations, options);

		for (let notation of notations) {
			this.totalMoves.push(notation);
		}
	}

	afterEach(callback) {
		this._afterEachCallbacks.push(callback);
	}

	/**
	 * @param {...*} callbackArgs - The arguments to call the function with.
	 */
	_triggerAfterEach(...callbackArgs) {
		this._afterEachCallbacks.forEach(fn => fn(...callbackArgs));
	}

	/**
	 * Solves the edge and/or corner and returns information about the state
	 * about them right before they are solved. It's important to construct the
	 * object in steps for debugging, so that we can still have access to e.g.
	 * the case number if the solve method fails.
	 */
	_solve(cubies = {}) {

		this.partition = {};
		this.partition.cubies = cubies;

		let { corner, edge } = cubies;

		this.partition.caseNumber = this._getCaseNumber({ corner, edge });

		this._solveCase(this.partition.caseNumber, { corner, edge });
		this.partition.moves = this.totalMoves;

		this.totalMoves = [];

		if (!this._overrideAfterEach) {
			this._triggerAfterEach(this.partition, this.phase);
		}

		return this.partition;
	}

	_solveCase(caseNumber, cubies = {}) {
		let { corner, edge } = cubies;
		this[`_solveCase${caseNumber}`]({ corner, edge });
	}
}




/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Vector; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_gl_vec3_angle__ = __webpack_require__(22);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_gl_vec3_angle___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_gl_vec3_angle__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_gl_vec3_cross__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_gl_vec3_cross___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_gl_vec3_cross__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_gl_vec3_rotateX__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_gl_vec3_rotateX___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_gl_vec3_rotateX__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_gl_vec3_rotateY__ = __webpack_require__(27);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_gl_vec3_rotateY___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_gl_vec3_rotateY__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_gl_vec3_rotateZ__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_gl_vec3_rotateZ___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_gl_vec3_rotateZ__);






const rotate = {
	x: __WEBPACK_IMPORTED_MODULE_2_gl_vec3_rotateX___default.a,
	y: __WEBPACK_IMPORTED_MODULE_3_gl_vec3_rotateY___default.a,
	z: __WEBPACK_IMPORTED_MODULE_4_gl_vec3_rotateZ___default.a
};

class Vector {
	/**
	 * Factory method.
	 * @param {string} vector - Space-deliminated x, y, and z values.
	 * @return {Vector}
	 */
	static FromString(vector) {
		return new Vector(vector.split(' ').map(value => parseInt(value)));
	}

	/**
	 * @param {array} vector1 - Vector 1.
	 * @param {array} vector2 - Vector 2.
	 * @return {boolean}
	 */
	static areEqual(vector1, vector2) {
		return vector1[0] === vector2[0] && vector1[1] === vector2[1] && vector1[2] === vector2[2];
	}

	/**
	 * Helper method. gl-vec3's angle function always returns positive but in many
	 * cases we want the angle in the direction from one vector to another. To get
	 * the sign of the angle, cross the two vectors and determine the direction the
	 * crossed vector, um, directs in. For example, the vector [0, -1, 0] would
	 * shoot negatively along the y-axis.
	 *
	 * @param {array} v1 - Vector 1.
	 * @param {array} v2 - Vector 2.
	 * @return {number}
	 */
	static getAngle(v1, v2) {
		let _angle = __WEBPACK_IMPORTED_MODULE_0_gl_vec3_angle___default()(v1, v2);
		let crossVector = __WEBPACK_IMPORTED_MODULE_1_gl_vec3_cross___default()([], v1, v2);
		let sign = new Vector(crossVector).getMagnitude();

		return sign ? _angle * sign : _angle;
	}

	/**
	 * Finds the rotation axis and angle to get from one normal to another.
	 * @param {array} normal1 - The from normal.
	 * @param {array} normal2 - The to normal.
	 * @return {object} - Stores the rotation axis and angle
	 */
	static getRotationFromNormals(normal1, normal2) {
		let axis = new Vector(__WEBPACK_IMPORTED_MODULE_1_gl_vec3_cross___default()([], normal1, normal2)).getAxis();
		let angle = Vector.getAngle(normal1, normal2);

		// when normal1 is equal to or opposite from normal2, it means 2 things: 1)
		// the cross axis is undefined and 2) the angle is either 0 or PI. This
		// means that rotating around the axis parallel to normal1 will not result
		// in any change, while rotating around either of the other two will work
		// properly.
		if (!axis) {
			let axes = ['x', 'y', 'z'];
			axes.splice(axes.indexOf(new Vector(normal1).getAxis()), 1);
			axis = axes[0];
		}

		return { axis, angle };
	}

	/**
	 * @param {object} rotation - The rotation to reverse.
	 * @return {object}
	 */
	static reverseRotation(rotation) {
		rotation.angle *= -1;
		return rotation;
	}

	/**
	 * @param {array} [vector] - Contains x, y, and z values.
	 */
	constructor(vector) {
		this.set(vector);
	}

	/**
	 * @return {array}
	 */
	toArray() {
		return this.vector;
	}

	/**
	 * @param {array} vector - The new vector to store.
	 */
	set(vector) {
		if (typeof vector === 'undefined') {
			return;
		}

		this.vector = vector.map(value => Math.round(value));
	}

	/**
	 * @param {number} value - The value to store.
	 */
	setX(value) {
		this.vector[0] = value;
	}

	/**
	 * @param {number} value - The value to store.
	 */
	setY(value) {
		this.vector[1] = value;
	}

	/**
	 * @param {number} value - The value to store.
	 */
	setZ(value) {
		this.vector[2] = value;
	}

	/**
	 * @return {number}
	 */
	getX() {
		return this.toArray()[0];
	}

	/**
	 * @return {number}
	 */
	getY() {
		return this.toArray()[1];
	}

	/**
	 * @return {number}
	 */
	getZ() {
		return this.toArray()[2];
	}

	/**
	 * Kind of a flimsy method. If this vector points parallel to an axis, this
	 * returns true. A hacky way to find this is to count the number of 0's and
	 * return true if and only if the count is 2.
	 * @return {boolean}
	 */
	isAxis() {
		let count = 0;
		for (let value of this.vector) {
			if (value === 0) {
				count += 1;
			}
		}

		return count === 2;
	}

	/**
	 * Kind of a flimsy method. If this vector points parallel to an axis, return
	 * that axis.
	 * @return {string}
	 */
	getAxis() {
		if (!this.isAxis()) {
			return;
		}

		if (this.vector[0] !== 0) return 'x';
		if (this.vector[1] !== 0) return 'y';
		if (this.vector[2] !== 0) return 'z';
	}

	/**
	 * Kind of a flimsy method. If this vector points parallel to an axis, return
	 * the magnitude of the value along that axis. (Basically, return whether it
	 * is positive or negative.)
	 * @return {number}
	 */
	getMagnitude() {
		if (!this.isAxis()) {
			return;
		}

		return this[`get${this.getAxis().toUpperCase()}`]();
	}

	/**
	 * @param {string} axis - The axis to rotate around.
	 * @param {number} angle - The angle of rotation.
	 * @return {Vector}
	 */
	rotate(axis, angle) {
		axis = axis.toLowerCase();

		this.set(rotate[axis]([], this.vector, [0, 0, 0], angle));
		return this;
	}
}




/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return F2LCaseBaseSolver; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__F2LBaseSolver__ = __webpack_require__(15);


class F2LCaseBaseSolver extends __WEBPACK_IMPORTED_MODULE_0__F2LBaseSolver__["a" /* F2LBaseSolver */] {
	solve({ corner, edge }) {
		return this._solve({ corner, edge });
	}
}




/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Cubie; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Vector__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Face__ = __webpack_require__(14);



class Cubie {
	/**
	 * Factory method. Returns an instance of a cubie identified by the faces it
	 * sits on.
	 * @param {array} faces - A list of all the faces this cubie sits on.
	 */
	static FromFaces(faces) {
		let position = new __WEBPACK_IMPORTED_MODULE_0__Vector__["a" /* Vector */]([0, 0, 0]);
		let colorMap = {};

		for (let face of faces) {
			if (!face) {
				continue;
			}

			let temp = new __WEBPACK_IMPORTED_MODULE_1__Face__["a" /* Face */](face);
			let axis = temp.vector.getAxis().toUpperCase();
			position[`set${axis}`](temp.vector.getMagnitude());

			colorMap[face.toLowerCase()] = temp.toString()[0].toLowerCase();
		}

		return new Cubie({ position: position.toArray(), colorMap });
	}

	/**
	 * @param {object} [options]
	 * @param {object} options.position - The cubie's position.
	 * @param {object} options.colorMap - A map with faces as keys and colors
	 * as values. For example: { 'front' : 'f' }.
	 */
	constructor({ position, colorMap = {} }) {
		this.position(position);
		this.colorMap = {};

		Object.keys(colorMap).forEach(face => {
			let color = colorMap[face];
			this.colorFace(face, color);
		});
	}

	/**
	 * @return {Cubie}
	 */
	clone() {
		return new Cubie({
			position: this.position(),
			colorMap: this.colorMap
		});
	}

	/**
	 * Getter/setter for the vector position.
	 * @param {array} [position] - The new position to store.
	 * @return {array}
	 */
	position(position) {
		if (typeof position === 'undefined') {
			return this.vector ? this.vector.toArray() : this.vector;
		}

		this.vector = new __WEBPACK_IMPORTED_MODULE_0__Vector__["a" /* Vector */](position);
	}

	/**
	 * @return {number}
	 */
	getX() {
		return this.vector.getX();
	}

	/**
	 * @return {number}
	 */
	getY() {
		return this.vector.getY();
	}

	/**
	 * @return {number}
	 */
	getZ() {
		return this.vector.getZ();
	}

	/**
	 * @return {boolean}
	 */
	isCorner() {
		return Object.keys(this.colorMap).length === 3;
	}

	/**
	 * @return {boolean}
	 */
	isEdge() {
		return Object.keys(this.colorMap).length === 2;
	}

	/**
	 * @return {boolean}
	 */
	isMiddle() {
		return Object.keys(this.colorMap).length === 1;
	}

	/**
	 * @return {array}
	 */
	colors() {
		return Object.keys(this.colorMap).map(face => this.colorMap[face]);
	}

	/**
	 * @param {string} color - Check if the cubie has this color.
	 * @return {boolean}
	 */
	hasColor(color) {
		color = color.toLowerCase();

		for (let face of Object.keys(this.colorMap)) {
			if (this.colorMap[face] === color) {
				return true;
			}
		}

		return false;
	}

	/**
	 * @param {string} face - Check if the cubie has this face.
	 * @return {boolean}
	 */
	hasFace(face) {
		face = face.toLowerCase();
		return Object.keys(this.colorMap).includes(face);
	}

	/**
	 * Sets a color on a given face or normal of a cubie.
	 * @param {string} face - The face of the cubie we want to set the color on.
	 * @param {string} color - The color we want to set.
	 * @return {Cubie}
	 */
	colorFace(face, color) {
		face = face.toLowerCase();
		color = color.toLowerCase();

		this.colorMap[face] = color;
		return this;
	}

	/**
	 * @param {string} face - The color on the face this cubie sits on.
	 * @return {string}
	 */
	getColorOfFace(face) {
		face = face.toLowerCase();

		return this.colorMap[face];
	}

	/**
	 * @param {string} color - Find the face that this color sits on.
	 * @return {string}
	 */
	getFaceOfColor(color) {
		color = color.toLowerCase();

		return Object.keys(this.colorMap).find(cubieColor => {
			return this.colorMap[cubieColor] === color;
		});
	}

	/**
	 * Return all the faces this cubie sits on.
	 * @return {array}
	 */
	faces() {
		return Object.keys(this.colorMap);
	}

	/**
	 * Rotates the position vector around `axis` by `angle`. Updates the internal
	 * position vector and the normal-color map.
	 * @param {string} axis - The axis of rotation.
	 * @param {number} angle - The magnitude of rotation.
	 * @return {null}
	 */
	rotate(axis, angle) {
		// update position vector after rotation
		this.vector.rotate(axis, angle);

		// update normal-color map
		let newMap = {}; // need to completely overwrite the old one

		// go through each normal, rotate it, and assign the new normal the old color
		for (let face of Object.keys(this.colorMap)) {
			let color = this.colorMap[face];
			let faceModel = new __WEBPACK_IMPORTED_MODULE_1__Face__["a" /* Face */](face);

			let newNormal = faceModel.rotate(axis, angle).normal().join(' ');
			let newFace = __WEBPACK_IMPORTED_MODULE_1__Face__["a" /* Face */].FromNormal(newNormal).toString().toLowerCase();

			newMap[newFace] = color;
		}

		this.colorMap = {};
		Object.keys(newMap).forEach(face => this.colorFace(face, newMap[face]));
	}
}




/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CrossSolver; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__BaseSolver__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__models_RubiksCube__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils__ = __webpack_require__(0);




const CROSS_COLOR = 'u';
const R = (moves) => __WEBPACK_IMPORTED_MODULE_1__models_RubiksCube__["a" /* RubiksCube */].reverseMoves(moves);

class CrossSolver extends __WEBPACK_IMPORTED_MODULE_0__BaseSolver__["a" /* BaseSolver */] {
	constructor(...args) {
		super(...args);

		this.phase = 'cross';
	}

	solve() {
		let crossEdges = this._getCrossEdges();
		for (let edge of crossEdges) {
			let partition = this._solve({ edge });
			this.partitions.push(partition);
		}

		return this.partitions;
	}

	isSolved() {
		let edges = this._getCrossEdges();
		for (let edge of edges) {
			if (!this.isEdgeSolved(edge)) {
				return false;
			}
		}

		return true;
	}

	isEdgeSolved(edge) {
		let otherColor = edge.colors().find(color => color !== 'u');
		let otherFace = edge.faces().find(face => face !== 'up');
		const matchesMiddle = otherFace[0] === otherColor;
		const isOnCrossFace = edge.getColorOfFace('up') === 'u';

		return isOnCrossFace && matchesMiddle;
	}

	/**
	 * Finds all edges that have 'F' as a color.
	 * @return {array}
	 */
	_getCrossEdges() {
		return this.cube.edges().filter(edge => edge.hasColor(CROSS_COLOR));
	}

	/**
	 * 6 Cases!
	 * 1) The edge's UP color is on the UP face.
	 * 2) the edge's UP color is on the DOWN face.
	 * 3) The edge's UP color is not on the UP or DOWN face and the other color is on the UP face.
	 * 4) The edge's UP color is not on the UP or DOWN face and the other color is on the DOWN face.
	 * 5) The edge's UP color is not on the UP or DOWN face and the other color is on the RELATIVE RIGHT face.
	 * 6) The edge's UP color is not on the UP or DOWN face and the other color is on the RELATIVE LEFT face.
	 *
	 * @param {cubie} edge
	 */
	_getCaseNumber({ edge }) {
		if (edge.getColorOfFace('up') === CROSS_COLOR) {
			return 1;
		} else if (edge.getColorOfFace('down') === CROSS_COLOR) {
			return 2;
		}

		if (edge.faces().includes('up')) {
			return 3;
		} else if (edge.faces().includes('down')) {
			return 4;
		}

		let crossFace = edge.getFaceOfColor(CROSS_COLOR);
		let otherFace = edge.getFaceOfColor(edge.colors().find(color => color !== CROSS_COLOR));
		let direction = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["c" /* getDirectionFromFaces */])(crossFace, otherFace, { up: 'up' });

		if (direction === 'right') {
			return 5;
		} else if (direction === 'left') {
			return 6;
		}
	}

	_solveCase1({ edge }) {
		if (this.isEdgeSolved(edge)) {
			return;
		}

		let face = edge.faces().find(face => face !== 'up');
		this.move(`${face} ${face}`, { upperCase: true });
		this._solveCase2({ edge });
	}

	_solveCase2({ edge }) {
		let solveMoves = this._case1And2Helper({ edge }, 2);
		this.move(solveMoves, { upperCase: true });
	}

	_solveCase3({ edge }) {
		let prepMove = this._case3And4Helper({ edge }, 3);
		this.move(prepMove, { upperCase: true });
		this._solveCase5({ edge });
	}

	_solveCase4({ edge }) {
		let prepMove = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["b" /* getRotationFromTo */])(
			'down',
			edge.getFaceOfColor('u'),
			__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["a" /* getFaceOfMove */])(edge.getColorOfFace('down'))
		);
		this.move(prepMove, { upperCase: true });

		let edgeToMiddle = R(edge.getFaceOfColor('u'));

		this.move(edgeToMiddle, { upperCase: true });
		this._solveCase5({ edge });
	}

	_solveCase5({ edge }) {
		let solveMoves = this._case5And6Helper({ edge }, 5);
		this.move(solveMoves, { upperCase: true });
	}

	_solveCase6({ edge }) {
		let solveMoves = this._case5And6Helper({ edge }, 6);
		this.move(solveMoves, { upperCase: true });
	}

	_case1And2Helper({ edge }, caseNum) {
		let crossColorFace = caseNum === 1 ? 'up' : 'down';
		let currentFace = edge.faces().find(face => face !== crossColorFace);
		let targetFace = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["a" /* getFaceOfMove */])(edge.getColorOfFace(currentFace));

		let solveMoves = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["b" /* getRotationFromTo */])(crossColorFace, currentFace, targetFace);

		if (caseNum === 2) {
			let edgeToCrossFace = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["f" /* getMoveOfFace */])(targetFace);
			solveMoves += ` ${edgeToCrossFace} ${edgeToCrossFace}`;
		}

		return solveMoves;
	}

	_case3And4Helper({ edge }, caseNum) {
		let prepMove = edge.faces().find(face => !['up', 'down'].includes(face));

		if (caseNum === 4) {
			prepMove = R(prepMove);
		}

		return prepMove;
	}

	_case5And6Helper({ edge }, caseNum) {
		let otherColor = edge.colors().find(color => color !== 'u');
		let currentFace = edge.getFaceOfColor(otherColor);
		let targetFace = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["a" /* getFaceOfMove */])(otherColor);

		let prepMove = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["b" /* getRotationFromTo */])('up', currentFace, targetFace);
		let edgeToCrossFace = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["f" /* getMoveOfFace */])(currentFace);

		if (caseNum === 6) {
			edgeToCrossFace = R(edgeToCrossFace);
		}

		return `${R(prepMove)} ${edgeToCrossFace} ${prepMove}`;
	}

	_getPartitionBefore({ edge }) {
		return { edge: edge.clone() };
	}

	_getPartitionAfter({ edge }) {
		return { edge };
	}
}




/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return F2LSolver; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__models_RubiksCube__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__F2LBaseSolver__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__cases_case_1__ = __webpack_require__(34);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__cases_case_2__ = __webpack_require__(35);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__cases_case_3__ = __webpack_require__(36);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__utils__ = __webpack_require__(0);







const R = (moves) => __WEBPACK_IMPORTED_MODULE_0__models_RubiksCube__["a" /* RubiksCube */].reverseMoves(moves);

class F2LSolver extends __WEBPACK_IMPORTED_MODULE_1__F2LBaseSolver__["a" /* F2LBaseSolver */] {
	constructor(...args) {
		super(...args);

		this.subCaseOptions = Object.assign(this.options, {
			_overrideAfterEach: true
		});
	}

	solve() {
		this.partitions = [];

		let pairs = this.getAllPairs();
		pairs.forEach(({ corner, edge }) => {
			let partition = this._solve({ corner, edge });
			this.partitions.push(partition);
		});

		return this.partitions;
	}

	isSolved() {
		let pairs = this.getAllPairs();
		for (let pair of pairs) {
			if (!this.isPairSolved(pair)) {
				return false;
			}
		}

		return true;
	}

	getAllPairs() {
		let corners = this.cube.corners().filter(corner => {
			return corner.hasColor('u');
		});
		let edges = this.cube.edges().filter(edge => {
			return !edge.hasColor('u') && !edge.hasColor('d');
		});

		let pairs = [];

		for (let edge of edges) {
			let corner = corners.find(corner => {
				let colors = edge.colors();
				return corner.hasColor(colors[0]) && corner.hasColor(colors[1]);
			});

			pairs.push({ edge, corner });
		}

		return pairs;
	}

	/**
	 * 4 top level cases: (cross face is UP)
	 *
	 * 1) Corner and edge are both on the DOWN face.
	 * 2) Corner is on the DOWN face and edge is not on DOWN face.
	 * 3) Corner is on UP face and edge is on DOWN face.
	 * 4) Corner is on UP face and edge is not on DOWN face.
	 */
	_getCaseNumber({ corner, edge }) {
		if (corner.faces().includes('down')) {
			if (edge.faces().includes('down')) {
				return 1;
			}
			if (!edge.faces().includes('down') && !edge.faces().includes('up')) {
				return 2;
			}
		}

		if (corner.faces().includes('up')) {
			if (edge.faces().includes('down')) {
				return 3;
			}
			if (!edge.faces().includes('down') && !edge.faces().includes('up')) {
				return 4;
			}
		}

		throw new Error('Could not find a top level F2L case');
	}

	_solveCase1({ corner, edge }) {
		let solver = new __WEBPACK_IMPORTED_MODULE_2__cases_case_1__["a" /* Case1Solver */](this.cube, this.subCaseOptions);
		let partition = solver.solve({ corner, edge });

		this.totalMoves = partition.moves;
		this.partition.caseNumber = [this.partition.caseNumber, partition.caseNumber];
	}

	_solveCase2({ corner, edge }) {
		let solver = new __WEBPACK_IMPORTED_MODULE_3__cases_case_2__["a" /* Case2Solver */](this.cube, this.subCaseOptions);
		let partition = solver.solve({ corner, edge });

		this.totalMoves = partition.moves;
		this.partition.caseNumber = [this.partition.caseNumber, partition.caseNumber];
	}

	_solveCase3({ corner, edge }) {
		let solver = new __WEBPACK_IMPORTED_MODULE_4__cases_case_3__["a" /* Case3Solver */](this.cube, this.subCaseOptions);
		let partition = solver.solve({ corner, edge });

		this.totalMoves = partition.moves;
		this.partition.caseNumber = [this.partition.caseNumber, partition.caseNumber];
	}

	_solveCase4({ corner, edge }) {
		if (this.isPairSolved({ corner, edge })) {
			return;
		}

		let solver;
		if (corner.faces().includes(edge.faces()[0]) &&
				corner.faces().includes(edge.faces()[1])) {
			solver = new __WEBPACK_IMPORTED_MODULE_2__cases_case_1__["a" /* Case1Solver */](this.cube, this.subCaseOptions);
		} else {
			solver = new __WEBPACK_IMPORTED_MODULE_3__cases_case_2__["a" /* Case2Solver */](this.cube, this.subCaseOptions);
		}

		let faces = corner.faces().filter(face => face !== 'up');
		let dir = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__utils__["c" /* getDirectionFromFaces */])(faces[0], faces[1], { up: 'down' });
		let cornerRightFace = dir === 'right' ? faces[1] : faces[0];

		this.move(`${cornerRightFace} D ${R(cornerRightFace)}`, { upperCase: true });

		let partition = solver.solve({ corner, edge });

		this.partition.caseNumber = [this.partition.caseNumber, partition.caseNumber];
		this.totalMoves = [...this.totalMoves, ...partition.moves];
	}
}




/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return OLLSolver; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__models_RubiksCube__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__BaseSolver__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils__ = __webpack_require__(0);




const SOLVED_STATE = '00000000';
const R = (moves) => __WEBPACK_IMPORTED_MODULE_0__models_RubiksCube__["a" /* RubiksCube */].reverseMoves(moves);

class OLLSolver extends __WEBPACK_IMPORTED_MODULE_1__BaseSolver__["a" /* BaseSolver */] {
	constructor(...args) {
		super(...args);
		this.phase = 'oll';

		// orientations in order based on http://badmephisto.com/oll.php, however the
		// actual algorithms may be different.
		this.algorithms = {
			[SOLVED_STATE]: '', // solved state
			'21000110': 'F R U RPrime UPrime FPrime', // 1
			'21211010': 'F R U RPrime UPrime FPrime F R U RPrime UPrime FPrime', // 2
			'10201020': 'R U2 RPrime UPrime R U RPrime UPrime R UPrime RPrime', // 3
			'01112000': 'F U R UPrime RPrime FPrime', // 4
			'11102120': 'F U R UPrime RPrime U R UPrime RPrime FPrime', // 5
			'11210000': 'RPrime UPrime FPrime U F R', // 6
			'11102021': 'FPrime LPrime UPrime L U LPrime UPrime L U F', // 7
			'10011110': 'R L2 BPrime L BPrime LPrime B2 L BPrime L RPrime', // 8
			'00202121': 'LPrime R2 B RPrime B R B2 RPrime B RPrime L', // 9
			'01111111': 'F U R UPrime RPrime FPrime L F U FPrime UPrime LPrime', // 10
			'21212101': 'F U R UPrime RPrime FPrime R B U BPrime UPrime RPrime', // 11
			'21211111': 'F R U RPrime UPrime FPrime B U L UPrime LPrime BPrime', // 12
			'20201010': 'R U2 R2 UPrime R2 UPrime R2 U2 R', // 13
			'01101110': 'R B RPrime L U LPrime UPrime R BPrime RPrime', // 14
			'21002120': 'LPrime BPrime L RPrime UPrime R U LPrime B L', // 15
			'21001100': 'RPrime F R U RPrime UPrime FPrime U R', // 16
			'01000100': 'R U RPrime UPrime MPrime U R UPrime rPrime', // 17
			'01010101': 'M U R U RPrime UPrime M2 U R UPrime rPrime', // 18
			'10211021': 'F R U RPrime UPrime R U RPrime UPrime FPrime B U L UPrime LPrime BPrime', // 19
			'11000120': 'R U RPrime UPrime RPrime F R FPrime', // 20
			'10000020': 'LPrime BPrime R B L BPrime RPrime B', // 21
			'20001000': 'B LPrime BPrime R B L BPrime RPrime', // 22
			'00112001': 'RPrime UPrime RPrime F R FPrime U R', // 23
			'21112111': 'R U2 RPrime RPrime F R FPrime U2 RPrime F R FPrime', // 24
			'10002101': 'R U2 RPrime RPrime F R FPrime R U2 RPrime', // 25
			'21110101': 'M U R U RPrime UPrime MPrime RPrime F R FPrime', // 26
			'11212010': 'F LPrime U2 L U2 L F2 LPrime F', // 27
			'01110020': 'R U RPrime U R UPrime RPrime UPrime RPrime F R FPrime', // 28
			'10012100': 'RPrime UPrime R UPrime RPrime U R U R BPrime RPrime B', // 29
			'10112021': 'RPrime UPrime R UPrime RPrime U FPrime U F R', // 30
			'01110121': 'F U R UPrime RPrime FPrime F U FPrime UPrime FPrime L F LPrime', // 31
			'01112101': 'F U R UPrime RPrime FPrime B U BPrime UPrime SPrime U B UPrime bPrime', // 32
			'21212000': 'lPrime U2 L U LPrime U l', // 33
			'01212020': 'r U RPrime U R U2 rPrime', // 34
			'00202020': 'R U RPrime U R U2 RPrime', // 35
			'10101000': 'RPrime UPrime R URprime RPrime U2 R', // 36
			'01001021': 'RPrime U R U2 RPrime UPrime FPrime U F U R', // 37
			'10200101': 'R UPrime RPrime U2 R U B UPrime BPrime UPrime RPrime', // 38
			'21102011': 'r U RPrime U R UPrime RPrime U R U2 rPrime', // 39
			'21112010': 'lPrime UPrime L UPrime LPrime U L UPrime LPrime U2 l', // 40
			'11100011': 'r U2 RPrime UPrime R UPrime rPrime', // 41
			'11012000': 'F R UPrime RPrime UPrime R U RPrime FPrime', // 42
			'11001011': 'lPrime UPrime L UPrime LPrime U2 l', // 43
			'01010000': 'r U RPrime UPrime M U R UPrime RPrime', // 44
			'01002110': 'R U RPrime UPrime BPrime RPrime F R FPrime B', // 45
			'01202120': 'L FPrime LPrime UPrime L F LPrime FPrime U F', // 46
			'11001110': 'RPrime F R U RPrime FPrime R F UPrime FPrime', // 47
			'10200000': 'R2 D RPrime U2 R DPrime RPrime U2 RPrime', // 48
			'20112011': 'RPrime U2 R2 U RPrime U R U2 BPrime RPrime B', // 49
			'10000121': 'R U BPrime UPrime RPrime U R B RPrime', // 50
			'11000021': 'RPrime UPrime F U R UPrime RPrime FPrime R', // 51
			'01100120': 'L FPrime LPrime UPrime L U F UPrime LPrime', // 52
			'11112020': 'RPrime F R2 FPrime U2 FPrime U2 F RPrime', // 53
			'20110100': 'BPrime RPrime B LPrime BPrime R R BPrime RPrime B2 L', // 54
			'20100101': 'B L BPrime R B L2 B L B2 RPrime', // 55
			'01101011': 'FPrime UPrime F L FPrime LPrime U L F LPrime', // 56
			'21012020': 'F U FPrime RPrime F R UPrime RPrime FPrime R', // 57
		};
	}

	isSolved() {
		return this.getOllString() === SOLVED_STATE;
	}

	solve() {
		return this._solve();
	}

	_getCaseNumber() {
		return this.getOllString();
	}

	_solveCase(ollString) {
		let pattern = this.findPattern(ollString);
		let algorithm = this.getAlgorithm(pattern);
		let frontFace = this._getFrontFace(ollString, pattern);

		this.move(algorithm, {
			orientation: { up: 'down', front: frontFace }
		});
	}

	getOllString() {
		let orientations = [];

		let cubies = this._getOllCubies();
		cubies.forEach(cubie => {
			let orientation = this._getCubieOrientation(cubie);
			orientations.push(orientation);
		});

		return orientations.join('');
	}

	/**
	 * @param {string} [ollString] - Probably unnecessary. If passed in, it saves
	 * a step computing the ollString.
	 */
	findPattern(ollString) {
		if (typeof ollString === 'undefined') {
			ollString = this.getOllString();
		}

		for (let i = 0; i < 4; i++) {
			let algorithm = this.algorithms[ollString];

			if (typeof algorithm === 'string') {
				return ollString;
			} else {
				ollString = this._rotateOllStringLeft(ollString);
			}
		}

		throw new Error(`No pattern found for oll string "${ollString}"`);
	}

	/**
	 * @param {string} [pattern] - The pattern on this OLL or the ollString.
	 */
	getAlgorithm(pattern) {
		if (typeof pattern === 'undefined') {
			pattern = this.getPattern(pattern); // pattern can be an ollString
		}

		if (typeof this.algorithms[pattern] === 'undefined') {
			throw new Error(`No algorithm found for pattern "${pattern}"`);
		}

		return this.algorithms[pattern];
	}

	_getOllCubies() {
		let positions = [
			['front', 'down', 'right'],
			['front', 'down'],
			['front', 'down', 'left'],
			['left', 'down'],
			['left', 'down', 'back'],
			['back', 'down'],
			['back', 'down', 'right'],
			['right', 'down']
		];

		return positions.map(pos => this.cube.getCubie(pos));
	}

	/**
	 * Returns a number indicating the orientation of the cubie.
	 * 0 --> The DOWN color is on the DOWN face.
	 * 1 --> The DOWN color is a clockwise rotation from "solved".
	 * 2 --> The DOWN color is a counter-clockwise rotation from "solved".
	 */
	_getCubieOrientation(cubie) {
		if (cubie.getColorOfFace('down') === 'd') {
			return 0;
		}

		// if cubie is an edge piece, return 1
		if (cubie.isEdge()) {
			return 1;
		}

		let [face1, face2] = cubie.faces().filter(face => face !== 'down');
		let dir = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["c" /* getDirectionFromFaces */])(face1, face2, { up: 'down' });
		let rightFace = dir === 'right' ? face2 : face1;

		return cubie.getColorOfFace(rightFace) === 'd' ? 1 : 2;
	}

	_getFrontFace(ollString, pattern) {
		let rotationOrder = ['front', 'left', 'back', 'right'];

		for (let i = 0; i < 4; i++) {
			if (ollString === pattern) {
				return rotationOrder[i];
			} else {
				ollString = this._rotateOllStringLeft(ollString);
			}
		}

		throw new Error(`OLL string "${ollString}" does not resolve to the pattern "${pattern}"`);
	}

	_rotateOllStringLeft(ollString) {
		return ollString.slice(2) + ollString.slice(0, 2);
	}

	_getPartitionBefore() {
		return this.getOllString();
	}

	_getPartitionAfter() {
		return null;
	}
}




/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return PLLSolver; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__BaseSolver__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils__ = __webpack_require__(0);



const SOLVED_STATE = '0 0 0 0 0 0 0 0';

class PLLSolver extends __WEBPACK_IMPORTED_MODULE_0__BaseSolver__["a" /* BaseSolver */] {
	constructor(...args) {
		super(...args);
		this.phase = 'pll';

		// permutations in order based on http://badmephisto.com/pll.php, however
		// the actual algorithms may be different.
		this.algorithms = {
			[SOLVED_STATE]: '', // already solved
			'2 -1 1 -1 1 0 0 2': 'R2 F2 RPrime BPrime R F2 RPrime B RPrime', // #1
			'-1 1 -1 2 2 0 0 1': 'R BPrime R F2 RPrime B R F2 R2', // #2
			'1 -1 2 2 0 0 1 -1': 'R UPrime R U R U R UPrime RPrime UPrime R2', // #3
			'-1 1 -1 1 0 0 2 2': 'R2 U R U RPrime UPrime RPrime UPrime RPrime U RPrime', // #4
			'2 2 2 2 2 2 2 2': 'M M U M M U2 M M U M M', // #5
			'0 1 1 1 1 0 2 2': 'R U RPrime UPrime RPrime F R2 UPrime RPrime UPrime R U RPrime FPrime', // #6
			'1 0 2 0 1 0 0 0': 'R U2 RPrime UPrime R U2 LPrime U RPrime UPrime L', // #7
			'0 2 2 0 1 1 1 1': 'F R UPrime RPrime UPrime R U RPrime FPrime R U RPrime UPrime RPrime F R FPrime', // #8
			'1 -1 -1 2 -1 -1 1 0': 'RPrime U2 R U2 RPrime F R U RPrime UPrime RPrime FPrime R2', // #9
			'0 1 -1 -1 2 -1 -1 1': 'R UPrime RPrime UPrime R U R D RPrime UPrime R DPrime RPrime U2 RPrime', // #10
			'0 2 -1 -1 -1 -1 2 0': 'RPrime U RPrime UPrime BPrime D BPrime DPrime B2 RPrime BPrime R B R', // #11
			'2 -1 -1 -1 -1 2 0 0': 'RPrime UPrime FPrime R U RPrime UPrime RPrime F R2 UPrime RPrime UPrime R U RPrime U R', // #12
			'-1 2 2 2 -1 2 0 2': 'L U LPrime B2 uPrime B UPrime BPrime U BPrime u B2', // #13
			'2 -1 2 0 2 -1 2 2': 'RPrime UPrime R B2 u BPrime U B UPrime B uPrime B2', // #14
			'2 -1 1 1 0 1 1 -1': 'R2 uPrime R UPrime R U RPrime u R2 B UPrime BPrime', // #15
			'1 0 1 1 -1 2 -1 1': 'R2 u RPrime U RPrime UPrime R uPrime R2 FPrime U F', // #16
			'1 -1 -1 1 1 -1 -1 1': 'U RPrime UPrime R UPrime R U R UPrime RPrime U R U R2 UPrime RPrime', // #17
			'0 1 0 0 0 1 0 2': 'LPrime U2 L U LPrime U2 R UPrime L U RPrime', // #18
			'1 1 -1 -1 1 1 -1 -1': 'R BPrime RPrime F R B RPrime FPrime R B RPrime F R BPrime RPrime FPrime', // #19
			'2 0 2 0 2 0 2 0': 'R U RPrime U R U RPrime FPrime R U RPrime UPrime RPrime F R2 UPrime RPrime U2 R UPrime RPrime', // #20
			'0 2 0 2 0 2 0 2': 'RPrime U R UPrime RPrime FPrime UPrime F R U RPrime F RPrime FPrime R UPrime R', // #21
		};
	}

	solve() {
		return this._solve();
	}

	_getCaseNumber() {
		return this.getPllString();
	}

	_solveCase(pllString) {
		let pattern = this.findPattern(pllString);
		let algorithm = this.getAlgorithm(pattern);
		let frontFace = this._getFrontFace(pllString, pattern);

		this.move(algorithm, {
			orientation: { up: 'down', front: frontFace }
		});

		// may need an extra rotation of DOWN for a complete solve
		let cubie = this.cube.getCubie(['down', 'front']); // any cubie on DOWN
		let origin = 'front';
		let target = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* getFaceOfMove */])(cubie.getColorOfFace(origin));
		let lastLayerMove = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* getRotationFromTo */])('down', origin, target);

		this.move(lastLayerMove);
	}

	isSolved() {
		return this.cube.isSolved();
	}

	/**
	 * Permutations are unique in the way that each cubie is permutated relative
	 * to the one adjacent to it. For each cubie (in order), find the relative
	 * direction from its color to the next cubie's color, and turn it into a
	 * number. This will allow each permutation to be held in a unique string.
	 */
	getPllString() {
		let pllString = [];
		let pllCubies = this._getPllCubies();

		let faces = ['front', 'left', 'back', 'right']; // we're upside down

		for (let i = 0; i < pllCubies.length; i++) {
			let cubie1 = pllCubies[i];
			let cubie2 = pllCubies[i + 1];
			let faceToCheck = faces[~~(i / 2)];

			// get the colors of the two cubies
			let color1 = cubie1.getColorOfFace(faceToCheck);

			// wrap around to the first cubie
			if (!cubie2) {
				cubie2 = pllCubies[0];
			}
			let color2 = cubie2.getColorOfFace(faceToCheck);

			// find the direction between the two
			let face1 = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* getFaceOfMove */])(color1);
			let face2 = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* getFaceOfMove */])(color2);

			// turn it into a number
			let direction = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["c" /* getDirectionFromFaces */])(face1, face2, { up: 'down' });
			if (direction === 'front') direction = 0;
			if (direction === 'right') direction = 1;
			if (direction === 'left') direction = -1;
			if (direction === 'back') direction = 2;

			pllString.push(direction);
		}

		return pllString.join(' ');
	}

	findPattern(pllString) {
		let initialString = pllString;

		if (typeof pllString === 'undefined') {
			pllString = this.getPllString();
		}

		for (let i = 0; i < 4; i++) {
			let algorithm = this.algorithms[pllString];

			if (typeof algorithm === 'string') {
				return pllString;
			} else {
				pllString = this._rotatePllStringLeft(pllString);
			}
		}

		throw new Error(`No pattern found for pll string "${initialString}"`);
	}

	getAlgorithm(pattern) {
		if (typeof pattern === 'undefined') {
			pattern = this.findPattern(pattern); // pattern can be a pllString
		}

		if (typeof this.algorithms[pattern] === 'undefined') {
			throw new Error(`No algorithm found for pattern "${pattern}"`);
		}

		return this.algorithms[pattern];
	}

	_getPllCubies() {
		let positions = [
			['front', 'down', 'right'],
			['front', 'down'],
			['front', 'down', 'left'],
			['left', 'down'],
			['left', 'down', 'back'],
			['back', 'down'],
			['back', 'down', 'right'],
			['right', 'down']
		];

		return positions.map(pos => this.cube.getCubie(pos));
	}

	_getCubiePermutation(cubie) {
		// pick a face, any face (expect for the down face)
		let face = cubie.faces().find(face => face !== 'down');

		// get the cube face this face lies on
		let cubeFace = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* getFaceOfMove */])(cubie.getColorOfFace(face));

		// find the move that will permute the cubie correctly
		let moveToSolveCubie = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* getRotationFromTo */])('down', face, cubeFace);
		moveToSolveCubie = moveToSolveCubie.toLowerCase();

		// translate the move to a number
		let dir;
		if (moveToSolveCubie === '') dir = 0;
		else if (moveToSolveCubie.includes('prime')) dir = 1;
		else if (moveToSolveCubie.split(' ').length > 1) dir = 2;
		else dir = -1;

		return dir;
	}

	_rotatePllStringLeft(pllString) {
		let arr = pllString.split(' ').map(num => parseInt(num));
		return [...arr.slice(2), ...arr.slice(0, 2)].join(' ');
	}

	_getFrontFace(pllString, pattern) {
		let rotationOrder = ['front', 'left', 'back', 'right'];

		for (let i = 0; i < 4; i++) {
			if (pllString === pattern) {
				return rotationOrder[i];
			} else {
				pllString = this._rotatePllStringLeft(pllString);
			}
		}

		throw new Error(`OLL string "${pllString}" does not resolve to the pattern "${pattern}"`);
	}
}




/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

module.exports = function () {
	return /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-PRZcf-nqry=><]/g;
};


/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = cross;

/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function cross(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2],
        bx = b[0], by = b[1], bz = b[2]

    out[0] = ay * bz - az * by
    out[1] = az * bx - ax * bz
    out[2] = ax * by - ay * bx
    return out
}

/***/ }),
/* 13 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Face; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Vector__ = __webpack_require__(4);


const faceToNormal = {
	front: '0 0 1',
	right: '1 0 0',
	up: '0 1 0',
	down: '0 -1 0',
	left: '-1 0 0',
	back: '0 0 -1'
};

class Face {
	/**
	 * Factory method.
	 * @param {string|array} normal - The normal that identifies this face.
	 * @return {Face}
	 */
	static FromNormal(normal) {
		if (typeof normal === 'string') {
			normal = __WEBPACK_IMPORTED_MODULE_0__Vector__["a" /* Vector */].FromString(normal).toArray();
		}

		return new Face(Face.getFace(normal));
	}

	/**
	 * @param {string} face - A string that identifies a face.
	 * @return {array}
	 */
	static getNormal(face) {
		return __WEBPACK_IMPORTED_MODULE_0__Vector__["a" /* Vector */].FromString(faceToNormal[face]).toArray();
	}

	/**
	 * @param {string|array} normal - The normal that identifies a face.
	 * @return {string}
	 */
	static getFace(normal) {
		if (typeof normal === 'string') {
			normal = __WEBPACK_IMPORTED_MODULE_0__Vector__["a" /* Vector */].FromString(normal).toArray();
		}

		for (let face of Object.keys(faceToNormal)) {
			if (normal.join(' ') === faceToNormal[face]) {
				return face;
			}
		}
	}

	/**
	 * @param {string} face - The string of a face, e.g. 'RIGHT'.
	 */
	constructor(face) {
		if (typeof face !== 'string') {
			throw new Error(`"face" must be a string (received: ${face})`);
		}

		face = face.toLowerCase();

		this.vector = __WEBPACK_IMPORTED_MODULE_0__Vector__["a" /* Vector */].FromString(faceToNormal[face]);
	}

	/**
	 * Method to return the normal as an array.
	 * @return {array}
	 */
	normal() {
		return this.vector.toArray();
	}

	/**
	 * @return {string}
	 */
	toString() {
		return Face.getFace(this.normal());
	}

	/**
	 * Simulates an orientation change where this face becomes the new given face.
	 * NOTE: this only changes this face's normals, not any cubies' positions.
	 * @param {string|Face} face - The new face, e.g. 'FRONT'
	 */
	orientTo(newFace) {
		if (typeof newFace === 'string') {
			newFace = new Face(newFace);
		}

		let { axis, angle } = __WEBPACK_IMPORTED_MODULE_0__Vector__["a" /* Vector */].getRotationFromNormals(this.normal(), newFace.normal());
		this.vector.rotate(axis, angle);
		return this;
	}

	/**
	 * Convenience method for rotating this face. NOTE: this only changes this
	 * face's normals, not any cubies' positions.
	 * @param {string} axis - Axis of rotation.
	 * @param {number} angle - Angle of rotation.
	 * @return {Face}
	 */
	rotate(axis, angle) {
		this.vector.rotate(axis, angle);
		return this;
	}
}

Face.FRONT = new Face('FRONT');
Face.RIGHT = new Face('RIGHT');
Face.UP = new Face('UP');
Face.DOWN = new Face('DOWN');
Face.LEFT = new Face('LEFT');
Face.BACK = new Face('BACK');




/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return F2LBaseSolver; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__BaseSolver__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__models_RubiksCube__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils__ = __webpack_require__(0);




const R = (moves) => __WEBPACK_IMPORTED_MODULE_1__models_RubiksCube__["a" /* RubiksCube */].reverseMoves(moves);

class F2LBaseSolver extends __WEBPACK_IMPORTED_MODULE_0__BaseSolver__["a" /* BaseSolver */] {
	constructor(...args) {
		super(...args);

		this.phase = 'f2l';
	}

	colorsMatch({ corner, edge }) {
		let colors = edge.colors();

		if (corner.colors().includes(colors[0]) && corner.colors().includes(colors[1])) {
			return true;
		}

		return false;
	}

	/**
	 * Returns true only if the pair is matched and in the correct slot.
	 */
	isPairSolved({ corner, edge }) {
		if (!this.isPairMatched({ corner, edge })) {
			return false;
		}

		// is the corner on the cross face?
		if (corner.getFaceOfColor('u') !== 'up') {
			return false;
		}

		// are the edge's colors on the correct face? (e.g. is the edge's 'F' color
		// on the 'FRONT' face)?
		for (let color of edge.colors()) {
			if (edge.getFaceOfColor(color) !== __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["a" /* getFaceOfMove */])(color)) {
				return false;
			}
		}

		return true;
	}

	isPairMatched({ corner, edge }) {
		// are the two non-cross colors the same?
		if (!this.colorsMatch({ corner, edge })) {
			return false;
		}

		// for each color, do the corner and edge share the same face?
		for (let color of edge.colors()) {
			if (corner.getFaceOfColor(color) !== edge.getFaceOfColor(color)) {
				return false;
			}
		}

		return true;
	}

	isPairSeparated({ corner, edge }) {
		// colors must match
		if (!this.colorsMatch({ corner, edge })) {
			return false;
		}

		// corner's white face cannot be UP or DOWN
		if (['up', 'down'].includes(corner.getFaceOfColor('u'))) {
			return false;
		}

		// edge must be on the DOWN face
		if (!edge.faces().includes('down')) {
			return false;
		}


		let otherColor = corner.colors().find(color => {
			return color !== 'u' && corner.getFaceOfColor(color) !== 'down';
		});

		// edge must be oriented properly
		if (edge.getFaceOfColor(otherColor) !== 'down') {
			return false;
		}

		// corner and edge must be one move away from matching
		let isOneMoveFromMatched = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["c" /* getDirectionFromFaces */])(
			corner.getFaceOfColor(otherColor),
			edge.getFaceOfColor(corner.getColorOfFace('down')),
			{ up: 'up' }
		) === 'back';

		return isOneMoveFromMatched;
	}

	solveMatchedPair({ corner, edge }) {
		if (!this.isPairMatched({ corner, edge })) {
			throw new Error('Pair is not matched');
		}

		// get the color that is not on the down face and is not the crossColor
		let matchedColor = edge.colors().find(color => {
			return edge.getFaceOfColor(color) !== 'down';
		});

		let isLeft = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["c" /* getDirectionFromFaces */])(
			edge.getFaceOfColor(matchedColor),
			corner.getFaceOfColor('u'),
			{ up: 'down' }
		) === 'left';

		let matchingFace = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["a" /* getFaceOfMove */])(matchedColor);
		let currentFace = corner.getFaceOfColor(matchedColor);
		let prepFace = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["e" /* getFaceFromDirection */])(matchingFace, isLeft ? 'left' : 'right', { up: 'down' });

		let prep = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["b" /* getRotationFromTo */])('down', currentFace, prepFace);
		let open = isLeft ? matchingFace : R(matchingFace);
		let insert = isLeft ? 'DPrime' : 'D';

		let solveMoves = [prep, open, insert, R(open)].join(' ');
		this.move(solveMoves, { upperCase: true });
		return solveMoves;
	}

	solveSeparatedPair({ corner, edge }) {
		if (!this.isPairSeparated({ corner, edge })) {
			throw new Error('Pair is not separated');
		}

		// get the color that is not on the down face and is not the crossColor
		let matchedColor = edge.colors().find(color => {
			return edge.getFaceOfColor(color) !== 'down';
		});

		let isLeft = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["c" /* getDirectionFromFaces */])(
			corner.getFaceOfColor('u'),
			edge.getFaceOfColor(matchedColor),
			{ up: 'down' }
		).toUpperCase() === 'LEFT';

		let currentFace = corner.getFaceOfColor('u');
		let prepFace = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["a" /* getFaceOfMove */])(matchedColor);

		let prep = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["b" /* getRotationFromTo */])('down', currentFace, prepFace);
		let match = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["f" /* getMoveOfFace */])(prepFace);
		match = isLeft ? R(match) : match;
		let insert = isLeft ? 'DPrime' : 'D';

		let solveMoves = [prep, match, insert, R(match)].join(' ');
		this.move(solveMoves, { upperCase: true });
		return solveMoves;
	}

	_getPartitionBefore({ corner, edge }) {
		return {
			corner: corner.clone(),
			edge: edge.clone()
		};
	}

	_getPartitionAfter({ corner, edge }) {
		return { corner, edge };
	}
}




/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Solver; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__models_RubiksCube__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__solvers_cross__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__solvers_f2l__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__solvers_oll__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__solvers_pll__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__utils__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__algorithm_shortener__ = __webpack_require__(2);








class Solver {
	/**
	 * @param {string|RubiksCube} cubeState - Can be one of 3 things:
	 * 1) A string representing a Rubik's Cube state.
	 * 2) A string containing a list of moves to make from a solved state to
	 *    identify a cube state.
	 * 3) An instance of a RubiksCube.
	 */
	constructor(cubeState, options) {
		if (cubeState instanceof __WEBPACK_IMPORTED_MODULE_0__models_RubiksCube__["a" /* RubiksCube */]) {
			this.cube = cubeState;
		} else if (typeof cubeState === 'string') {
			// if there are spaces present in cubeState, assume it's a set of
			// scramble moves.
			// it's possible that one or no scramble moves are present.
			let magicNum = 6; // longest possible move string -- e.g. Rprime
			if (cubeState.split(' ').length > 1 || cubeState.length <= magicNum) {
				this.cube = __WEBPACK_IMPORTED_MODULE_0__models_RubiksCube__["a" /* RubiksCube */].Solved();
				this.cube.move(cubeState);
			} else {
				this.cube = new __WEBPACK_IMPORTED_MODULE_0__models_RubiksCube__["a" /* RubiksCube */](cubeState);
			}
		} else {
			throw new Error('"cubeState" is not a valid cubeState. Please provide a list of scramble moves or a string representing a cube state');
		}

		this.options = options;
		this.phases = ['cross', 'f2l', 'oll', 'pll'];
		this.progress = {};

		this.phases.forEach(phase => this.progress[phase] = []);

		// save each partition to this.progress after each solve
		const afterEach = (partition, phase) => {
			this._updateProgress(partition, phase);
		};

		this.currentPhase = null; // good for debugging
		this.currentSolver = null; // good for debugging

		this.crossSolver = new __WEBPACK_IMPORTED_MODULE_1__solvers_cross__["a" /* CrossSolver */](this.cube, this.options);
		this.f2lSolver = new __WEBPACK_IMPORTED_MODULE_2__solvers_f2l__["a" /* F2LSolver */](this.cube, this.options);
		this.ollSolver = new __WEBPACK_IMPORTED_MODULE_3__solvers_oll__["a" /* OLLSolver */](this.cube, this.options);
		this.pllSolver = new __WEBPACK_IMPORTED_MODULE_4__solvers_pll__["a" /* PLLSolver */](this.cube, this.options);

		this.afterEach('all', afterEach);
	}

	afterEach(phases, callback) {
		// argument parsing
		if (typeof phases === 'function') {
			// if first argument is a function, default phases to 'all'
			callback = phases;
			phases = 'all';
		} else if (typeof phases === 'string') {
			if (phases === 'all') {
				// 'all': shortcut for array of all phases
				phases = this.phases.slice();
			} else {
				// lastly turn phases into an array
				phases = [phases];
			}
		}

		// error handling
		if (typeof callback !== 'function') {
			throw new Error('"afterEach" callback is not a function.');
		}

		// error handling
		for (let phase of phases) {
			if (!this.phases.includes(phase)) {
				throw new Error(`Phase "${phase}" isn't recognized. Please specify "cross", "f2l", "oll", "pll", or "all".`);
			}
		}

		// if everything has gone okay, add the callback
		for (let phase of phases) {
			let solver = this[`${phase}Solver`];
			solver.afterEach(callback);
		}
	}

	solve() {
		this.currentPhase = 'cross';
		this.currentSolver = this.crossSolver;
		this.crossSolver.solve();

		this.currentPhase = 'f2l';
		this.currentSolver = this.f2lSolver;
		this.f2lSolver.solve();

		this.currentPhase = 'oll';
		this.currentSolver = this.ollSolver;
		this.ollSolver.solve();

		this.currentPhase = 'pll';
		this.currentSolver = this.pllSolver;
		this.pllSolver.solve();
	}

	getMoves() {
		let moves = [];

		Object.keys(this.progress).forEach(phase => {
			let partitions = this.progress[phase];
			partitions.forEach(partition => moves.push(...partition.moves));
		});

		moves = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__utils__["h" /* normalizeNotations */])(moves);

		return moves.join(' ');
	}

	getPartitions() {
		let ret = {};
		let phases = Object.keys(this.progress);
		phases.forEach(phase => {
			let partitions = this.progress[phase];

			if (partitions.length === 1) {
				ret[phase] = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__algorithm_shortener__["a" /* algorithmShortener */])(partitions[0].moves);
			} else {
				let phaseMoves = [];
				this.progress[phase].forEach(partition => {
					phaseMoves.push(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__algorithm_shortener__["a" /* algorithmShortener */])(partition.moves));
				});
				ret[phase] = phaseMoves;
			}
		});

		return ret;
	}

	isCrossEdgeSolved(edge) {
		return this.crossSolver.isEdgeSolved(edge);
	}

	isF2LPairSolved({ corner, edge }) {
		return this.f2lSolver.isPairSolved({ corner, edge });
	}

	isOLLSolved() {
		return this.ollSolver.isSolved();
	}

	isPLLSolved() {
		return this.pllSolver.isSolved();
	}

	_updateProgress(partition, phase) {
		this.progress[phase].push(partition);
	}
}




/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {

function assembleStyles () {
	var styles = {
		modifiers: {
			reset: [0, 0],
			bold: [1, 22], // 21 isn't widely supported and 22 does the same thing
			dim: [2, 22],
			italic: [3, 23],
			underline: [4, 24],
			inverse: [7, 27],
			hidden: [8, 28],
			strikethrough: [9, 29]
		},
		colors: {
			black: [30, 39],
			red: [31, 39],
			green: [32, 39],
			yellow: [33, 39],
			blue: [34, 39],
			magenta: [35, 39],
			cyan: [36, 39],
			white: [37, 39],
			gray: [90, 39]
		},
		bgColors: {
			bgBlack: [40, 49],
			bgRed: [41, 49],
			bgGreen: [42, 49],
			bgYellow: [43, 49],
			bgBlue: [44, 49],
			bgMagenta: [45, 49],
			bgCyan: [46, 49],
			bgWhite: [47, 49]
		}
	};

	// fix humans
	styles.colors.grey = styles.colors.gray;

	Object.keys(styles).forEach(function (groupName) {
		var group = styles[groupName];

		Object.keys(group).forEach(function (styleName) {
			var style = group[styleName];

			styles[styleName] = group[styleName] = {
				open: '\u001b[' + style[0] + 'm',
				close: '\u001b[' + style[1] + 'm'
			};
		});

		Object.defineProperty(styles, groupName, {
			value: group,
			enumerable: false
		});
	});

	return styles;
}

Object.defineProperty(module, 'exports', {
	enumerable: true,
	get: assembleStyles
});

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(32)(module)))

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

let chalk;
let DEBUG;

const DEFAULTS = {
	cancel() {
		return false;
	},
	ignore() {
		return false;
	}
};

class Combiner {
	constructor(input, options) {
		this.options = Object.assign({}, DEFAULTS, options);

		if (this.options.DEBUG) {
			chalk = __webpack_require__(20);
			DEBUG = options.DEBUG;
		}

		this.input = input.slice();
		this.output = [];
	}

	run() {
		if (this.input.length <= 1) {
			return this.input;
		}

		this.temp = [this.input.shift()];

		let action, actionValue, tempSnapshot; // for debugging

		while (this.temp.length > 0) {
			debug(() => {
				console.log(chalk.bold('========= START ========='));
				this._logInfo();
				console.log();
			});

			// find the first element that shouldn't be ignored
			let notIgnoredIdx, notIgnoredEl;

			if (this.temp.length === 1) {
				notIgnoredIdx = 0;
				notIgnoredEl = this.input[notIgnoredIdx];

				while (notIgnoredIdx < this.input.length && this.options.ignore(this.temp[0], notIgnoredEl)) {
					notIgnoredEl = this.input[++notIgnoredIdx];
				}

				if (notIgnoredIdx < this.input.length) {
					this.temp.push(notIgnoredEl);
				}
			}

			debug(() => tempSnapshot = this.temp.slice());

			if (this.temp.length === 0) {
				debug(() => {
					console.log(chalk.green('breaking'));
					console.log(chalk.bold('========= END ========='));
					console.log();
				});
				break;
			}

			if (this.temp.length === 1) {
				this.output.push(this.temp.pop());
				this.populateTempForward();

				debug(() => {
					console.log(chalk.green('continuing'));
					this._logInfo();
					console.log(chalk.bold('========= END ========='));
					console.log();
				});
				continue;
			}

			if (this.options.compare(this.temp[0], this.temp[1])) {
				// remove the combined element from the input array
				if (notIgnoredIdx !== undefined) {
					this.input.splice(notIgnoredIdx, 1);
				}
				const value = this.options.combine(this.temp[0], this.temp[1]);

				debug(() => {
					action = 'Combining:';
					actionValue = value;
				});

				this.temp = this.options.cancel(value) ? [] : [value];

				this.populateTempBackward();
				if (this.temp.length === 0) {
					this.populateTempForward();
				}
			} else {
				this.output.push(this.temp.shift());

				// This keeps elements in order.
				// if (notIgnoredIdx === 0) {
				// 	this.input.splice(notIgnoredIdx, 1);
				// } else {
				// 	this.temp = this.input.splice(0, 1);
				// }

				if (notIgnoredIdx !== undefined) {
					if (notIgnoredIdx > 0) {
						this.temp = this.input.splice(0, 1);
					} else {
						this.input.splice(notIgnoredIdx, 1);
					}
				}

				debug(() => action = 'Skipping:');
			}

			debug(() => {
				// log the action taken
				console.log(chalk.green(action), tempSnapshot);
				console.log(chalk.green('value:'), actionValue);
				console.log();

				// log the status
				this._logInfo();
				console.log(chalk.bold('========= END ========='));
				console.log();

				action = null;
				actionValue = null;
				tempSnapshot = null;
			});
		}

		debug(() => {
			console.log(chalk.bold.green('========= FINAL ========='));
			this._logInfo();
			console.log(chalk.bold.green('========= FINAL ========='));
			console.log();
		});

		return this.output;
	}

	populateTempBackward() {
		if (this.output.length > 0) {
			this.temp.unshift(this.output.pop());
		}
	}

	populateTempForward() {
		if (this.input.length > 0) {
			this.temp.push(this.input.shift());
		}
	}

	_logInfo() {
		console.log(chalk.bold('output'), this.output);
		console.log(chalk.bold('temp'), this.temp);
		console.log(chalk.bold('input'), this.input);
	}
}

module.exports = Combiner;


//=======================================================
// Debugging functions
//=======================================================
function debug(callback) {
	if (!DEBUG) {
		return;
	}

	callback && callback();
}


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

const Combiner = __webpack_require__(18);

/**
 * Given an array, combines adjacent elements. Callbacks that indicate if two
 * elements can be combined and what the combined value is must be given. When
 * two elements are combined, both elements are removed from the output array
 * and in their place is the combined value. If the combined value is undefined
 * then both elements are removed and nothing is inserted in their place. When
 * the combined value is inserted, the following elements will be compared with
 * the combined value and not the original element.
 *
 * @param {array} array - The input array.
 * @param {object} options - Options.
 * @param {function} [options.cancel] - Returns a boolean indicating whether two elements should be cancelled (and no value is inserted).
 * @param {function} options.combine - Returns the combined value of two elements.
 * @param {function} options.compare - Returns a boolean indicating whether two elements can be combined.
 * @param {function} [options.ignore] - Returns a boolean indicating whether to ignore an element and continue with the next.
 */
module.exports = (input, options = {}) => {
	validateInput(input, options);

	const combiner = new Combiner(input, options);
	return combiner.run();
};


//=======================================================
// Helper functions
//=======================================================
function validateInput(input, options) {
	if (!input) {
		throw new Error(`Why are you even importing this.`);
	}

	if (!options.compare) {
		throw new Error(`options.compare callback must be present`);
	}

	if (!options.combine) {
		throw new Error(`options.combine callback must be present`);
	}
}


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {
var escapeStringRegexp = __webpack_require__(21);
var ansiStyles = __webpack_require__(17);
var stripAnsi = __webpack_require__(30);
var hasAnsi = __webpack_require__(29);
var supportsColor = __webpack_require__(31);
var defineProps = Object.defineProperties;
var isSimpleWindowsTerm = process.platform === 'win32' && !/^xterm/i.test(process.env.TERM);

function Chalk(options) {
	// detect mode if not set manually
	this.enabled = !options || options.enabled === undefined ? supportsColor : options.enabled;
}

// use bright blue on Windows as the normal blue color is illegible
if (isSimpleWindowsTerm) {
	ansiStyles.blue.open = '\u001b[94m';
}

var styles = (function () {
	var ret = {};

	Object.keys(ansiStyles).forEach(function (key) {
		ansiStyles[key].closeRe = new RegExp(escapeStringRegexp(ansiStyles[key].close), 'g');

		ret[key] = {
			get: function () {
				return build.call(this, this._styles.concat(key));
			}
		};
	});

	return ret;
})();

var proto = defineProps(function chalk() {}, styles);

function build(_styles) {
	var builder = function () {
		return applyStyle.apply(builder, arguments);
	};

	builder._styles = _styles;
	builder.enabled = this.enabled;
	// __proto__ is used because we must return a function, but there is
	// no way to create a function with a different prototype.
	/* eslint-disable no-proto */
	builder.__proto__ = proto;

	return builder;
}

function applyStyle() {
	// support varags, but simply cast to string in case there's only one arg
	var args = arguments;
	var argsLen = args.length;
	var str = argsLen !== 0 && String(arguments[0]);

	if (argsLen > 1) {
		// don't slice `arguments`, it prevents v8 optimizations
		for (var a = 1; a < argsLen; a++) {
			str += ' ' + args[a];
		}
	}

	if (!this.enabled || !str) {
		return str;
	}

	var nestedStyles = this._styles;
	var i = nestedStyles.length;

	// Turns out that on Windows dimmed gray text becomes invisible in cmd.exe,
	// see https://github.com/chalk/chalk/issues/58
	// If we're on Windows and we're dealing with a gray color, temporarily make 'dim' a noop.
	var originalDim = ansiStyles.dim.open;
	if (isSimpleWindowsTerm && (nestedStyles.indexOf('gray') !== -1 || nestedStyles.indexOf('grey') !== -1)) {
		ansiStyles.dim.open = '';
	}

	while (i--) {
		var code = ansiStyles[nestedStyles[i]];

		// Replace any instances already present with a re-opening code
		// otherwise only the part of the string until said closing code
		// will be colored, and the rest will simply be 'plain'.
		str = code.open + str.replace(code.closeRe, code.open) + code.close;
	}

	// Reset the original 'dim' if we changed it to work around the Windows dimmed gray issue.
	ansiStyles.dim.open = originalDim;

	return str;
}

function init() {
	var ret = {};

	Object.keys(styles).forEach(function (name) {
		ret[name] = {
			get: function () {
				return build.call(this, [name]);
			}
		};
	});

	return ret;
}

defineProps(Chalk.prototype, init());

module.exports = new Chalk();
module.exports.styles = ansiStyles;
module.exports.hasColor = hasAnsi;
module.exports.stripColor = stripAnsi;
module.exports.supportsColor = supportsColor;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(13)))

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

module.exports = function (str) {
	if (typeof str !== 'string') {
		throw new TypeError('Expected a string');
	}

	return str.replace(matchOperatorsRe, '\\$&');
};


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = angle

var fromValues = __webpack_require__(24)
var normalize = __webpack_require__(25)
var dot = __webpack_require__(23)

/**
 * Get the angle between two 3D vectors
 * @param {vec3} a The first operand
 * @param {vec3} b The second operand
 * @returns {Number} The angle in radians
 */
function angle(a, b) {
    var tempA = fromValues(a[0], a[1], a[2])
    var tempB = fromValues(b[0], b[1], b[2])
 
    normalize(tempA, tempA)
    normalize(tempB, tempB)
 
    var cosine = dot(tempA, tempB)

    if(cosine > 1.0){
        return 0
    } else {
        return Math.acos(cosine)
    }     
}


/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = dot;

/**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */
function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

/***/ }),
/* 24 */
/***/ (function(module, exports) {

module.exports = fromValues;

/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */
function fromValues(x, y, z) {
    var out = new Float32Array(3)
    out[0] = x
    out[1] = y
    out[2] = z
    return out
}

/***/ }),
/* 25 */
/***/ (function(module, exports) {

module.exports = normalize;

/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */
function normalize(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2]
    var len = x*x + y*y + z*z
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len)
        out[0] = a[0] * len
        out[1] = a[1] * len
        out[2] = a[2] * len
    }
    return out
}

/***/ }),
/* 26 */
/***/ (function(module, exports) {

module.exports = rotateX;

/**
 * Rotate a 3D vector around the x-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
function rotateX(out, a, b, c){
    var by = b[1]
    var bz = b[2]

    // Translate point to the origin
    var py = a[1] - by
    var pz = a[2] - bz

    var sc = Math.sin(c)
    var cc = Math.cos(c)

    // perform rotation and translate to correct position
    out[0] = a[0]
    out[1] = by + py * cc - pz * sc
    out[2] = bz + py * sc + pz * cc

    return out
}


/***/ }),
/* 27 */
/***/ (function(module, exports) {

module.exports = rotateY;

/**
 * Rotate a 3D vector around the y-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
function rotateY(out, a, b, c){
    var bx = b[0]
    var bz = b[2]

    // translate point to the origin
    var px = a[0] - bx
    var pz = a[2] - bz
    
    var sc = Math.sin(c)
    var cc = Math.cos(c)
  
    // perform rotation and translate to correct position
    out[0] = bx + pz * sc + px * cc
    out[1] = a[1]
    out[2] = bz + pz * cc - px * sc
  
    return out
}


/***/ }),
/* 28 */
/***/ (function(module, exports) {

module.exports = rotateZ;

/**
 * Rotate a 3D vector around the z-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
function rotateZ(out, a, b, c){
    var bx = b[0]
    var by = b[1]

    //Translate point to the origin
    var px = a[0] - bx
    var py = a[1] - by
  
    var sc = Math.sin(c)
    var cc = Math.cos(c)

    // perform rotation and translate to correct position
    out[0] = bx + px * cc - py * sc
    out[1] = by + px * sc + py * cc
    out[2] = a[2]
  
    return out
}


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var ansiRegex = __webpack_require__(11);
var re = new RegExp(ansiRegex().source); // remove the `g` flag
module.exports = re.test.bind(re);


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var ansiRegex = __webpack_require__(11)();

module.exports = function (str) {
	return typeof str === 'string' ? str.replace(ansiRegex, '') : str;
};


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {
var argv = process.argv;

var terminator = argv.indexOf('--');
var hasFlag = function (flag) {
	flag = '--' + flag;
	var pos = argv.indexOf(flag);
	return pos !== -1 && (terminator !== -1 ? pos < terminator : true);
};

module.exports = (function () {
	if ('FORCE_COLOR' in process.env) {
		return true;
	}

	if (hasFlag('no-color') ||
		hasFlag('no-colors') ||
		hasFlag('color=false')) {
		return false;
	}

	if (hasFlag('color') ||
		hasFlag('colors') ||
		hasFlag('color=true') ||
		hasFlag('color=always')) {
		return true;
	}

	if (process.stdout && !process.stdout.isTTY) {
		return false;
	}

	if (process.platform === 'win32') {
		return true;
	}

	if ('COLORTERM' in process.env) {
		return true;
	}

	if (process.env.TERM === 'dumb') {
		return false;
	}

	if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(process.env.TERM)) {
		return true;
	}

	return false;
})();

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(13)))

/***/ }),
/* 32 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if(!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 33 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Solver__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__algorithm_shortener__ = __webpack_require__(2);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Solver", function() { return __WEBPACK_IMPORTED_MODULE_0__Solver__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__models_Cubie__ = __webpack_require__(6);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Cubie", function() { return __WEBPACK_IMPORTED_MODULE_2__models_Cubie__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__models_RubiksCube__ = __webpack_require__(1);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "RubiksCube", function() { return __WEBPACK_IMPORTED_MODULE_3__models_RubiksCube__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__solvers_cross__ = __webpack_require__(7);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "CrossSolver", function() { return __WEBPACK_IMPORTED_MODULE_4__solvers_cross__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__solvers_f2l__ = __webpack_require__(8);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "F2LSolver", function() { return __WEBPACK_IMPORTED_MODULE_5__solvers_f2l__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__solvers_oll__ = __webpack_require__(9);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "OLLSolver", function() { return __WEBPACK_IMPORTED_MODULE_6__solvers_oll__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__solvers_pll__ = __webpack_require__(10);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "PLLSolver", function() { return __WEBPACK_IMPORTED_MODULE_7__solvers_pll__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "algorithmShortener", function() { return __WEBPACK_IMPORTED_MODULE_1__algorithm_shortener__["a"]; });



// solver constructor


// models



// solvers





// algorithm shortener


/**
 * @param {string} cubeState - The string representing a cube state.
 * @param {object} options
 * @prop {boolean} options.partitioned - Whether to separate moves according to
 * phase.
 */
/* harmony default export */ __webpack_exports__["default"] = ((cubeState, options = {}) => {
	let solver = new __WEBPACK_IMPORTED_MODULE_0__Solver__["a" /* Solver */](cubeState, options);
	solver.solve();

	if (options.partitioned) {
		return solver.getPartitions();
	} else {
		return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__algorithm_shortener__["a" /* algorithmShortener */])(solver.getMoves());
	}
});


/***/ }),
/* 34 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Case1Solver; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__models_RubiksCube__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__F2LCaseBaseSolver__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils__ = __webpack_require__(0);




const R = (moves) => __WEBPACK_IMPORTED_MODULE_0__models_RubiksCube__["a" /* RubiksCube */].reverseMoves(moves);

/**
 * Top level case 1:
 * Both corner and edge are on the DOWN face.
 */
class Case1Solver extends __WEBPACK_IMPORTED_MODULE_1__F2LCaseBaseSolver__["a" /* F2LCaseBaseSolver */] {
	/**
	 * 10 Cases:
	 * 1) Pair is matched.
	 * 2) Pair is separated.
	 *
	 * ---- Group 1: Corner's white color is on DOWN face ----
	 * 3) Corner and edge share a face and colors on that face are equal.
	 * 4) Corner and edge share a face and colors on that face are not equal.
	 * 5) Corner and edge do not share a face.
	 *
	 * ---- Group 2: Corner's "other" color matches edge's "primary" color ----
	 * 6) Corner shares a face with edge.
	 * 7) Corner does not share a face with edge.
	 *
	 * ---- Group 3: Corner's "other" color doesn't match edge's "primary" color ----
	 * 8) Edge shares a face with corner's cross color's face.
	 * 9) Edge shares a face with corner's other color's face.
	 * 10) Corner does not share a face with edge.
	 *
	 * TODO: refactor
	 */
	_getCaseNumber({ corner, edge }) {
		if (this.isPairMatched({ corner, edge })) {
			return 1;
		}
		if (this.isPairSeparated({ corner, edge })) {
			return 2;
		}

		let sharedFace;
		edge.faces().forEach(face => {
			if (corner.faces().includes(face) && face !== 'down') {
				sharedFace = face;
			}
		});
		let otherColor = corner.colors().find(color => {
			return color !== 'u' && color !== corner.getColorOfFace('down');
		});
		let primaryColor = edge.colors().find(c => edge.getFaceOfColor(c) !== 'down');

		// Group 1
		if (corner.getFaceOfColor('u') === 'down') {
			if (sharedFace) {
				if (corner.getColorOfFace(sharedFace) === edge.getColorOfFace(sharedFace)) {
					return 3;
				} else {
					return 4;
				}
			} else {
				return 5;
			}
		}

		// Group 2
		if (otherColor === primaryColor) {
			if (sharedFace) {
				return 6;
			} else {
				return 7;
			}
		}

		// Group 3
		if (sharedFace) {
			if (sharedFace === corner.getFaceOfColor('u')) {
				return 8;
			} else {
				return 9;
			}
		} else {
			return 10;
		}
	}

	_solveCase1({ corner, edge }) {
		return this.solveMatchedPair({ corner, edge });
	}

	_solveCase2({ corner, edge }) {
		return this.solveSeparatedPair({ corner, edge });
	}

	_solveCase3({ corner, edge }) {
		// calculate which side the corner is on, the position, etc.
		let currentFace = edge.faces().find(face => face !== 'down');
		let targetFace = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["a" /* getFaceOfMove */])(edge.getColorOfFace('down'));
		let prepFace = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["e" /* getFaceFromDirection */])(targetFace, 'back', { up: 'down' });
		let otherFace = corner.getFaceOfColor(edge.getColorOfFace('down'));
		let isLeft = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["e" /* getFaceFromDirection */])(currentFace, otherFace, { up: 'down' }) === 'left';

		// the moves
		let prep = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["b" /* getRotationFromTo */])('down', currentFace, prepFace);
		let moveFace = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["a" /* getFaceOfMove */])(edge.getColorOfFace(currentFace));
		let dir = isLeft ? 'D' : 'DPrime';

		moveFace = isLeft ? moveFace : R(moveFace);

		let solveMoves = `${prep} ${moveFace} ${moveFace} D D `;
		solveMoves += `${moveFace} ${dir} ${R(moveFace)} ${dir} ${moveFace} ${moveFace}`;
		this.move(solveMoves, { upperCase: true });
	}

	_solveCase4({ corner, edge }) {
		// calculate which side the corner is on, the position, etc.
		let currentFace = edge.faces().find(face => face !== 'down');
		let targetFace = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["a" /* getFaceOfMove */])(edge.getColorOfFace(currentFace));
		let otherFace = corner.faces().find(face => !edge.faces().includes(face));
		let isLeft = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["e" /* getFaceFromDirection */])(otherFace, currentFace, { up: 'down' }) === 'left';

		// the moves
		let prep = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["b" /* getRotationFromTo */])('down', currentFace, targetFace);
		let moveFace = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["f" /* getMoveOfFace */])(targetFace);
		moveFace = isLeft ? R(moveFace) : moveFace;

		this.move(`${prep} ${moveFace} D D ${R(moveFace)}`, { upperCase: true });
		this.solveSeparatedPair({ corner, edge });
	}

	_solveCase5({ corner, edge }) {
		let primary = edge.colors().find(color => edge.getFaceOfColor(color) !== 'down');
		let secondary = edge.colors().find(color => edge.getFaceOfColor(color) === 'down');

		let isLeft = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["e" /* getFaceFromDirection */])(
			__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["a" /* getFaceOfMove */])(primary),
			__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["a" /* getFaceOfMove */])(secondary),
			{ up: 'down' }
		) === 'right';

		let edgeCurrent = edge.getFaceOfColor(primary);
		let edgeTarget = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["a" /* getFaceOfMove */])(primary);

		// do the prep move now. need to calculate things after this move is done
		let edgePrep = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["b" /* getRotationFromTo */])('down', edgeCurrent, edgeTarget);
		this.move(edgePrep, { upperCase: true });

		// calculate corner stuff
		let cornerCurrent = corner.getFaceOfColor(primary);
		let cornerTarget = edgeTarget;

		// the moves
		let cornerPrep = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["b" /* getRotationFromTo */])('down', cornerCurrent, cornerTarget);
		let open = isLeft ? R(edgeTarget) : edgeTarget;

		this.move(`${open} ${cornerPrep} ${R(open)}`, { upperCase: true });
		this.solveMatchedPair({ corner, edge });
	}

	_solveCase6({ corner, edge }) {
		let primary = edge.colors().find(color => edge.getFaceOfColor(color) !== 'down');

		let currentFace = edge.getFaceOfColor(primary);
		let targetFace = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["a" /* getFaceOfMove */])(edge.getColorOfFace('down'));
		let isLeft = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["c" /* getDirectionFromFaces */])(
			currentFace,
			corner.getFaceOfColor(primary),
			{ up: 'down' }
		) === 'left';

		let prep = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["b" /* getRotationFromTo */])('down', currentFace, targetFace);
		let moveFace = isLeft ? targetFace : R(targetFace);
		let dir = isLeft ? 'DPrime' : 'D';

		this.move(`${prep} ${moveFace} ${dir} ${R(moveFace)}`, { upperCase: true });
		this.solveSeparatedPair({ corner, edge});
	}

	_solveCase7({ corner, edge }) {
		let primary = edge.colors().find(c => edge.getFaceOfColor(c) !== 'down');
		let cornerCurrent = corner.getFaceOfColor('u');
		let cornerTarget = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["a" /* getFaceOfMove */])(primary);
		let isLeft = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["c" /* getDirectionFromFaces */])(
			corner.getFaceOfColor(primary),
			corner.getFaceOfColor('u'),
			{ up: 'down' }
		) === 'left';

		let cornerPrep = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["b" /* getRotationFromTo */])('down', cornerCurrent, cornerTarget);
		this.move(cornerPrep, { upperCase: true });

		let edgeCurrent = edge.getFaceOfColor(primary);
		let edgeTarget = corner.getFaceOfColor(primary);

		let open = isLeft ? corner.getFaceOfColor('u') : R(corner.getFaceOfColor('u'));
		let edgeMatch = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["b" /* getRotationFromTo */])('down', edgeCurrent, edgeTarget);
		this.move(`${open} ${edgeMatch} ${R(open)}`, { upperCase: true });

		this.solveMatchedPair({ corner, edge });
	}

	_solveCase8({ corner, edge }) {
		let primary = edge.colors().find(c => edge.getFaceOfColor(c) !== 'down');
		let secondary = edge.colors().find(c => edge.getFaceOfColor(c) === 'down');

		let currentFace = corner.getFaceOfColor(secondary);
		let targetFace = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["a" /* getFaceOfMove */])(primary);

		let isLeft = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["c" /* getDirectionFromFaces */])(
			currentFace,
			corner.getFaceOfColor('u'),
			{ up: 'down' }
		) === 'left';

		let prep = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["b" /* getRotationFromTo */])('down', currentFace, targetFace);
		let open = isLeft ? R(targetFace) : targetFace;
		let dir = isLeft ? 'D' : 'DPrime';

		this.move(`${prep} ${open} ${dir} ${R(open)}`, { upperCase: true });
		this.solveSeparatedPair({ corner, edge });
	}

	_solveCase9({ corner, edge }) {
		let otherColor = edge.colors().find(c => edge.getFaceOfColor(c) === 'down');
		let currentFace = corner.getFaceOfColor('u');
		let targetFace = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["a" /* getFaceOfMove */])(otherColor);

		let isLeft = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["c" /* getDirectionFromFaces */])(
			corner.getFaceOfColor(otherColor),
			currentFace,
			{ up: 'down' }
		) === 'left';

		let prep = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["b" /* getRotationFromTo */])('down', currentFace, targetFace);
		let moveFace = isLeft ? targetFace : R(targetFace);

		this.move(`${prep} ${moveFace} D D ${R(moveFace)}`, { upperCase: true });
		this.solveSeparatedPair({ corner, edge });
	}

	_solveCase10({ corner, edge }) {
		let primary = edge.colors().find(c => edge.getFaceOfColor(c) !== 'down');
		let secondary = edge.colors().find(c => edge.getFaceOfColor(c) === 'down');
		let cornerCurrent = corner.getFaceOfColor('u');
		let cornerTarget = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["a" /* getFaceOfMove */])(secondary);
		let isLeft = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["c" /* getDirectionFromFaces */])(
			corner.getFaceOfColor(secondary),
			corner.getFaceOfColor('u'),
			{ up: 'down' }
		) === 'left';

		let cornerPrep = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["b" /* getRotationFromTo */])('down', cornerCurrent, cornerTarget);
		this.move(cornerPrep, { upperCase: true });

		let edgeCurrent = edge.getFaceOfColor(primary);
		let edgeTarget = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["a" /* getFaceOfMove */])(primary);

		let open = isLeft ? cornerTarget : R(cornerTarget);
		let edgePrep = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["b" /* getRotationFromTo */])('down', edgeCurrent, edgeTarget);

		this.move(`${open} ${edgePrep} ${R(open)}`, { upperCase: true });
		this.solveSeparatedPair({ corner, edge });
	}
}




/***/ }),
/* 35 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Case2Solver; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__models_RubiksCube__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__F2LCaseBaseSolver__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils__ = __webpack_require__(0);




const R = (moves) => __WEBPACK_IMPORTED_MODULE_0__models_RubiksCube__["a" /* RubiksCube */].reverseMoves(moves);

/**
 * Top level case 2:
 * Corner is on the DOWN face and edge is not on DOWN or UP face.
 */
class Case2Solver extends __WEBPACK_IMPORTED_MODULE_1__F2LCaseBaseSolver__["a" /* F2LCaseBaseSolver */] {
	/**
	 * 4 cases:
	 *
	 * ---- Group 1: Corner's white color is on DOWN face ----
	 * 1) Pair can be matched up.
	 * 2) Pair cannot be matched up.
	 *
	 * ---- Group 2: Corner's white color is not on DOWN face ----
	 * 3) Corner's other color can match up with the edge color on that face.
	 * 4) Corner's other color cannot match up with the edge color on that face.
	 */
	_getCaseNumber({ corner, edge }) {
		// get relative right faces of corner and edge
		let cFaces = corner.faces().filter(face => face !== 'down');
		let eFaces = edge.faces();
		let cornerDir = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["c" /* getDirectionFromFaces */])(cFaces[0], cFaces[1], { up: 'down' });
		let edgeDir = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["c" /* getDirectionFromFaces */])(eFaces[0], eFaces[1], { up: 'down' });
		let cornerRight = cornerDir === 'right' ? cFaces[1] : cFaces[0];
		let edgeRight = edgeDir === 'right' ? eFaces[1] : eFaces[0];

		if (corner.getFaceOfColor('u') === 'down') {
			if (corner.getColorOfFace(cornerRight) === edge.getColorOfFace(edgeRight)) {
				return 1;
			} else {
				return 2;
			}
		}

		let otherColor = corner.colors().find(color => {
			return color !== 'u' && color !== corner.getColorOfFace('down');
		});
		let isLeft = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["c" /* getDirectionFromFaces */])(
			corner.getFaceOfColor(otherColor),
			corner.getFaceOfColor('u'),
			{ up: 'down' }
		) === 'left';
		let matchingEdgeColor = isLeft ?
			edge.getColorOfFace(edgeRight) :
			edge.colors().find(c => edge.getFaceOfColor(c) !== edgeRight);

		if (otherColor === matchingEdgeColor) {
			return 3;
		} else {
			return 4;
		}
	}

	_solveCase1({ corner, edge }) {
		let color = edge.colors()[0];
		let currentFace = corner.getFaceOfColor(color);
		let targetFace = edge.getFaceOfColor(color);

		let prep = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["b" /* getRotationFromTo */])('down', currentFace, targetFace);
		this.move(prep, { upperCase: true });

		let [face1, face2] = edge.faces();
		let dir = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["c" /* getDirectionFromFaces */])(face1 , face2, { up: 'down' });
		let rightFace = dir === 'right' ? face2 : face1;

		this.move(`${rightFace} DPrime ${R(rightFace)}`, { upperCase: true });
		this.solveMatchedPair({ corner, edge });
	}

	_solveCase2({ corner, edge }) {
		let currentFace = corner.getFaceOfColor(edge.colors()[0]);
		let targetFace = edge.getFaceOfColor(edge.colors()[1]);

		let prep = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["b" /* getRotationFromTo */])('down', currentFace, targetFace);
		this.move(prep, { upperCase: true });

		let dir = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["c" /* getDirectionFromFaces */])(edge.faces()[0], edge.faces()[1], { up: 'down' });
		let rightFace = edge.faces()[dir === 'right' ? 1 : 0];

		this.move(`${rightFace} D ${R(rightFace)} DPrime`, { upperCase: true });
		this.move(`${rightFace} D ${R(rightFace)}`, { upperCase: true });

		this.solveSeparatedPair({ corner, edge });
	}

	_solveCase3({ corner, edge }) {
		this._case3And4Helper({ corner, edge }, 3);
	}

	_solveCase4({ corner, edge }) {
		this._case3And4Helper({ corner, edge }, 4);
	}

	_case3And4Helper({ corner, edge }, caseNum) {
		let downColor = corner.getColorOfFace('down');
		let otherColor = corner.colors().find(c => ![downColor, 'u'].includes(c));
		let matchingColor = caseNum === 3 ? otherColor : downColor;
		let isLeft = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["c" /* getDirectionFromFaces */])(
			corner.getFaceOfColor(otherColor),
			corner.getFaceOfColor('u'),
			{ up: 'down' }
		) === 'left';

		let currentFace = corner.getFaceOfColor('u');
		// let targetFace = getFaceOfMove(otherColor)
		let targetFace = edge.getFaceOfColor(matchingColor);

		let prep = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["b" /* getRotationFromTo */])('down', currentFace, targetFace);
		let moveFace = isLeft ? targetFace : R(targetFace);
		let dir = isLeft ? 'DPrime' : 'D';
		dir = caseNum === 4 ? R(dir) : dir;

		this.move(`${prep} ${moveFace} ${dir} ${R(moveFace)}`, { upperCase: true });

		let method = `solve${caseNum === 3 ? 'Matched' : 'Separated'}Pair`;
		this[method]({ corner, edge });
	}
}




/***/ }),
/* 36 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Case3Solver; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__models_RubiksCube__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__F2LCaseBaseSolver__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils__ = __webpack_require__(0);




const R = (moves) => __WEBPACK_IMPORTED_MODULE_0__models_RubiksCube__["a" /* RubiksCube */].reverseMoves(moves);

/**
 * Top level case 3:
 * Corner is on UP face and edge is on DOWN face.
 */
class Case3Solver extends __WEBPACK_IMPORTED_MODULE_1__F2LCaseBaseSolver__["a" /* F2LCaseBaseSolver */] {
	/**
   * 2 cases:
   *
   * 1) Corner's cross color is on the cross face.
   * 2) Corner's cross color is not on the cross face.
   */
	_getCaseNumber({ corner, edge }) {
		if (corner.getColorOfFace('up') === 'u') {
			return 1;
		} else {
			return 2;
		}
	}

	_solveCase1({ corner, edge }) {
		let faces = corner.faces().filter(face => face !== 'up');
		let direction = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["c" /* getDirectionFromFaces */])(faces[0], faces[1], { up: 'down' });
		let [leftFace, rightFace] = direction === 'right' ? faces : faces.reverse();

		let currentFace = edge.faces().find(face => face !== 'down');
		let primaryColor = edge.getColorOfFace(currentFace);

		let targetFace = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["e" /* getFaceFromDirection */])(
			corner.getFaceOfColor(primaryColor),
			primaryColor === corner.getColorOfFace(rightFace) ? 'right' : 'left',
			{ up: 'down' }
		);
		let isLeft = primaryColor === corner.getColorOfFace(leftFace);

		let prep = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["b" /* getRotationFromTo */])('down', currentFace, targetFace);
		let moveFace = isLeft ? rightFace : R(leftFace);
		let dir = isLeft ? 'DPrime' : 'D';

		this.move(`${prep} ${moveFace} ${dir} ${R(moveFace)}`, { upperCase: true });
		this.solveMatchedPair({ corner, edge });
	}

	_solveCase2({ corner, edge }) {
		let otherColor = corner.colors().find(color => {
			return color !== 'u' && corner.getFaceOfColor(color) !== 'up';
		});
		let currentFace = edge.faces().find(face => face !== 'down');
		let primaryColor = edge.getColorOfFace(currentFace);

		let willBeMatched = otherColor !== primaryColor;
		let targetFace = corner.getFaceOfColor(willBeMatched ? otherColor : 'u');

		let prep = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["b" /* getRotationFromTo */])('down', currentFace, targetFace);
		let isLeft = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["c" /* getDirectionFromFaces */])(
			corner.getFaceOfColor(otherColor),
			corner.getFaceOfColor('u'),
			{ up: 'down' }
		) === 'left';
		let dir = isLeft ? 'DPrime' : 'D';
		let moveFace = corner.getFaceOfColor('u');
		moveFace = isLeft ? R(moveFace) : moveFace;

		this.move(`${prep} ${moveFace} ${dir} ${R(moveFace)}`, { upperCase: true });
		let solveFn = `solve${willBeMatched ? 'Matched' : 'Separated'}Pair`;
		this[solveFn]({ corner, edge });
	}
}




/***/ })
/******/ ]);
});
const __e = __g["rubiksCubeSolver"];
export default (__e && __e.default) ? __e.default : __e;
