module.exports = function (grunt) {

	var DEBUG = !!grunt.option("debug");
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			dist: {
				src: [
					'src/noinfopath-helpers.js',
					'src/noinfopath-filters.js',
					'src/noinfopath-navigator.js',
					'src/no-action-queue.js',
					'src/no-state-params-helper.js',
					'src/docready.js',
					'src/print.js',
					'src/no-parameters.js',
					'src/area-loader.js'
				],
				dest: 'dist/noinfopath-helpers.js'
			},
			readme: {
				src: ['docs/noinfopath-helpers.md'],
				dest: 'readme.md'
			}
		},
		watch: {
			dev: {
				files: ['src/*.*'],
				tasks: ['compile'],
				options: {
					livereload: false
				}
			}
		},
		karma: {
			unit: {
				configFile: "karma.conf.js"
			},
			continuous: {
				configFile: 'karma.conf.js',
				singleRun: true,
				browsers: ['PhantomJS']
			}
		},
		bumpup: {
			file: 'package.json'
		},
		version: {
			options: {
				prefix: '@version\\s*'
			},
			defaults: {
				src: ['src/noinfopath-helpers.js']
			}
		},
		nodocs: {
			internal: { // Task
				options: { // Options
					src: 'dist/noinfopath-helpers.js', // Source Location
					dest: 'docs/noinfopath-helpers.md', // Destination Location
					start: ['/*', '/**'] // How the code block starts.
				}
			}
		},
		copy: {
			dev: {
				files: [{
					expand: true,
					flatten: true,
					src: ['dist/noinfopath-helpers.js'],
					dest: '/Users/gochinj/ws/rm/v4/root/lib/js/noinfopath/'
                 }]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-bumpup');
	grunt.loadNpmTasks('grunt-version');
	grunt.loadNpmTasks('grunt-nodocs');

	//Default task(s).
	grunt.registerTask('build', ['bumpup', 'version', 'concat:dist', 'nodocs', 'concat:readme']);
	grunt.registerTask('compile', ['concat:dist', 'nodocs', 'concat:readme', 'copy:dev']);
};
